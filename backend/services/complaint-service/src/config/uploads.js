import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Overridable so the container image can mount a volume instead of writing to
// the (often read-only) application directory.
export const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(serviceRoot, 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

// Extension is derived from the declared MIME type, never from the client
// filename: that keeps executable/unknown types off disk and makes
// path traversal via the filename impossible.
const extensionForMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic'
};

export const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = extensionForMimeType[file.mimetype] ?? '.bin';
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  if (!extensionForMimeType[file.mimetype]) {
    const error = new Error('Unsupported image type');
    error.code = 'UNSUPPORTED_IMAGE_TYPE';
    return callback(error);
  }
  return callback(null, true);
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxUploadBytes, files: 1 }
}).single('photo');

// Public URL handed back to the client and stored in complaints.image_url.
// The gateway exposes it unauthenticated on /api/media because evidence photos
// are rendered by plain <img src>, which cannot carry an Authorization header.
export function publicUrlFor(filename) {
  return `/api/media/${filename}`;
}

// Translates multer failures into JSON the gateway and UI already understand.
export function describeUploadError(error) {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return { status: 413, message: `Photo is too large. Maximum size is ${Math.round(maxUploadBytes / (1024 * 1024))} MB.` };
  }
  if (error?.code === 'UNSUPPORTED_IMAGE_TYPE') {
    return { status: 415, message: 'Only JPG, PNG, WEBP, GIF or HEIC images are allowed.' };
  }
  if (error?.code === 'LIMIT_UNEXPECTED_FILE') {
    return { status: 400, message: 'Unexpected file field. Send the image as "photo".' };
  }
  return null;
}
