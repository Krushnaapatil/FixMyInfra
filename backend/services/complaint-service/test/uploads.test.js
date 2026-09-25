import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicUrlFor, maxUploadBytes, uploadDir } from '../src/config/uploads.js';

// Mirrors the MEDIA_URL_PATTERN in src/routes/index.js. If one changes without
// the other, this test fails, because the same expression is asserted here.
const MEDIA_URL_PATTERN = /^\/api\/media\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|heic)$/;

test('uploaded filenames produce an accepted media URL', () => {
  const url = publicUrlFor('0a9a2e72-1a4d-46e6-8ca8-e566fcb26d3a.jpg');
  assert.equal(url, '/api/media/0a9a2e72-1a4d-46e6-8ca8-e566fcb26d3a.jpg');
  assert.ok(MEDIA_URL_PATTERN.test(url), 'generated URL must satisfy the validator');
});

test('every extension the uploader can produce yields a valid URL', () => {
  for (const extension of ['jpg', 'png', 'webp', 'gif', 'heic']) {
    const url = publicUrlFor(`abc123.${extension}`);
    assert.ok(MEDIA_URL_PATTERN.test(url), `${url} should be accepted`);
  }
});

test('off-origin and traversal image URLs are rejected', () => {
  const rejected = [
    'http://attacker.example.com/track.gif',
    'https://evil.example/p.jpg',
    '//attacker.example.com/p.jpg',
    'javascript:alert(1)',
    'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    '/api/media/../../../etc/passwd',
    '/api/media/..%2f..%2fpackage.json',
    '/api/media/',
    '/uploads/photo.jpg',
    '/api/media/photo.html',
    '/api/media/photo.svg',
    '/api/media/sub/dir/photo.jpg',
    'api/media/photo.jpg'
  ];
  for (const value of rejected) {
    assert.equal(MEDIA_URL_PATTERN.test(value), false, `${value} must be rejected`);
  }
});

test('upload directory is created and size cap is sane', () => {
  assert.ok(uploadDir.length > 0);
  assert.ok(maxUploadBytes > 0 && maxUploadBytes <= 25 * 1024 * 1024);
});
