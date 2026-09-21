-- Backfills departments for complaints filed before category routing
-- existed. Idempotent: only touches rows with a NULL department_id.
-- Apply as the database owner (see 005-create-outbox-events.sql).
UPDATE complaints SET department_id = '11111111-1111-4111-8111-111111111111'
  WHERE department_id IS NULL AND lower(category) = lower('Road damage');
UPDATE complaints SET department_id = '22222222-2222-4222-8222-222222222222'
  WHERE department_id IS NULL AND lower(category) = lower('Water and drainage');
UPDATE complaints SET department_id = '33333333-3333-4333-8333-333333333333'
  WHERE department_id IS NULL AND lower(category) = lower('Garbage');
UPDATE complaints SET department_id = '44444444-4444-4444-8444-444444444444'
  WHERE department_id IS NULL AND lower(category) = lower('Streetlight');
