import { Router } from 'express';
import { Op } from 'sequelize';
import { Complaint } from '../models/Complaint.js';
import { sequelize } from '../db/sequelize.js';
import { routeCategoryToDepartment, canonicalCategory as canonicalizeCategory, CATEGORY_LABELS } from '../routing/departments.js';
import { writeOutboxEvent, publishPendingEvents, outboxEnabled } from '../outbox/outbox.js';
import { uploadPhoto, publicUrlFor, describeUploadError } from '../config/uploads.js';

const router = Router();
const statuses = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Only paths minted by the /attachments upload endpoint: the public /api/media
// prefix, a filename with no dot (so ".." cannot appear), and an image
// extension from the upload allowlist. No scheme, no host, no traversal, so a
// stored value can never point off-origin or escape the uploads directory.
const MEDIA_URL_PATTERN = /^\/api\/media\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|heic)$/;

function isUuid(value) {
  return typeof value === 'string' && uuidPattern.test(value);
}

// Two-step evidence upload: the client posts the photo here, gets back a URL,
// then submits the complaint as JSON with that URL. Keeping the complaint
// write JSON-only means the transactional-outbox path stays unchanged.
router.post('/attachments', (req, res) => {
  uploadPhoto(req, res, (error) => {
    if (error) {
      const described = describeUploadError(error);
      if (described) {
        return res.status(described.status).json({ error: described.message });
      }
      console.error('Photo upload failed:', error);
      return res.status(500).json({ error: 'Failed to upload photo' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No photo was provided' });
    }
    return res.status(201).json({ imageUrl: publicUrlFor(req.file.filename) });
  });
});

router.post('/', async (req, res) => {
  const { category, description, imageUrl, latitude, longitude } = req.body;

  if (typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'category is required' });
  }
  // An unrecognised category would produce a complaint no department owns, so
  // it is rejected outright rather than silently stored as unrouted.
  const canonicalCategory = canonicalizeCategory(category);
  if (!canonicalCategory) {
    return res.status(400).json({
      error: 'Unsupported issue category',
      validCategories: CATEGORY_LABELS
    });
  }
  if (typeof latitude !== 'number' || Number.isNaN(latitude)) {
    return res.status(400).json({ error: 'latitude must be a number' });
  }
  if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'longitude must be a number' });
  }
  // Evidence must come from our own upload endpoint. Accepting an arbitrary
  // client-supplied URL lets an attacker point an officer's browser at a
  // tracking pixel or an external host, leaking the officer's IP and the fact
  // that they opened the complaint.
  if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
    if (typeof imageUrl !== 'string' || !MEDIA_URL_PATTERN.test(imageUrl)) {
      return res.status(400).json({ error: 'imageUrl must be a path returned by the photo upload endpoint' });
    }
  }

  try {
    if (!outboxEnabled) {
      // Degraded mode: outbox table unavailable, persist without emitting.
      const complaint = await Complaint.create({
        userId: req.header('X-User-Id') || null,
        category: canonicalCategory,
        description,
        imageUrl,
        latitude,
        longitude,
        departmentId: routeCategoryToDepartment(category)
      });
      return res.status(201).json(complaint.toJSON());
    }

    const transaction = await sequelize.transaction();
    try {
      const complaint = await Complaint.create(
        {
          userId: req.header('X-User-Id') || null,
          category: canonicalCategory,
          description,
          imageUrl,
          latitude,
          longitude,
          departmentId: routeCategoryToDepartment(category)
        },
        { transaction }
      );

      // Written in the same transaction as the complaint (transactional outbox).
      await writeOutboxEvent(transaction, {
        aggregateType: 'complaint',
        aggregateId: complaint.id,
        eventType: 'created',
        payload: complaint.toJSON()
      });
      await transaction.commit();

      // Best-effort publish; a poller retries when the broker is down.
      void publishPendingEvents();
      return res.status(201).json(complaint.toJSON());
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Failed to create complaint:', error);
    return res.status(500).json({ error: 'Failed to create complaint' });
  }
});

router.get('/', async (req, res) => {
  try {
    const role = req.header('X-User-Role');
    const userId = req.header('X-User-Id');
    const where = role === 'CITIZEN' && userId ? { userId } : {};
    const complaints = await Complaint.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json({ complaints: complaints.map((complaint) => complaint.toJSON()) });
  } catch (error) {
    console.error('Failed to list complaints:', error);
    return res.status(500).json({ error: 'Failed to list complaints' });
  }
});

router.get('/assigned', async (req, res) => {
  if (req.header('X-User-Role') !== 'OFFICER') {
    return res.status(403).json({ error: 'Officer access required' });
  }

  const departmentId = req.header('X-User-Department-Id');
  // Officers self-register, so an unassigned officer is an anonymous visitor
  // with an OFFICER token. Returning the whole queue to them exposed every
  // complaint in the city, so an unassigned officer now waits for an admin to
  // assign them a department (PATCH /api/auth/users/:id/department).
  if (!departmentId) {
    return res.status(403).json({
      error: 'Awaiting department assignment',
      code: 'DEPARTMENT_UNASSIGNED'
    });
  }

  try {
    // Assigned officers see their own department plus the unrouted pool so
    // nothing is stranded.
    const where = { [Op.or]: [{ departmentId }, { departmentId: null }] };
    const complaints = await Complaint.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    return res.json({ complaints: complaints.map((complaint) => complaint.toJSON()) });
  } catch (error) {
    console.error('Failed to list assigned complaints:', error);
    return res.status(500).json({ error: 'Failed to list assigned complaints' });
  }
});

router.get('/:id', async (req, res) => {
  if (!isUuid(req.params.id)) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    if (req.header('X-User-Role') === 'CITIZEN' && complaint.userId !== req.header('X-User-Id')) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    return res.json(complaint.toJSON());
  } catch (error) {
    console.error('Failed to get complaint:', error);
    return res.status(500).json({ error: 'Failed to get complaint' });
  }
});

router.patch('/:id/status', async (req, res) => {
  if (!isUuid(req.params.id)) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  const role = req.header('X-User-Role');
  if (!['OFFICER', 'ADMIN'].includes(role)) {
    return res.status(403).json({ error: 'Officer or admin access required' });
  }

  const { status } = req.body ?? {};
  if (!statuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid complaint status' });
  }

  try {
    if (!outboxEnabled) {
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      complaint.status = status;
      await complaint.save();
      return res.json(complaint.toJSON());
    }

    const transaction = await sequelize.transaction();
    try {
      const complaint = await Complaint.findByPk(req.params.id, { transaction });
      if (!complaint) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Strict status sequencing is a known follow-up; any valid status transition is allowed for now.
      complaint.status = status;
      await complaint.save({ transaction });
      await writeOutboxEvent(transaction, {
        aggregateType: 'complaint',
        aggregateId: complaint.id,
        eventType: 'status_changed',
        payload: { status, complaint: complaint.toJSON() }
      });
      await transaction.commit();

      void publishPendingEvents();
      return res.json(complaint.toJSON());
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Failed to update complaint status:', error);
    return res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

export default router;
