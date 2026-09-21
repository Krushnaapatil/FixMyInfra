import { Router } from 'express';
import { Op } from 'sequelize';
import { Complaint } from '../models/Complaint.js';
import { sequelize } from '../db/sequelize.js';
import { routeCategoryToDepartment } from '../routing/departments.js';
import { writeOutboxEvent, publishPendingEvents, outboxEnabled } from '../outbox/outbox.js';

const router = Router();
const statuses = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && uuidPattern.test(value);
}

router.post('/', async (req, res) => {
  const { category, description, imageUrl, latitude, longitude } = req.body;

  if (typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'category is required' });
  }
  if (typeof latitude !== 'number' || Number.isNaN(latitude)) {
    return res.status(400).json({ error: 'latitude must be a number' });
  }
  if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'longitude must be a number' });
  }

  try {
    if (!outboxEnabled) {
      // Degraded mode: outbox table unavailable, persist without emitting.
      const complaint = await Complaint.create({
        userId: req.header('X-User-Id') || null,
        category: category.trim(),
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
          category: category.trim(),
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
  try {
    // Officers without a department see the whole queue; officers with one
    // see their department plus the unrouted pool so nothing is stranded.
    const where = !departmentId
      ? {}
      : { [Op.or]: [{ departmentId }, { departmentId: null }] };
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
