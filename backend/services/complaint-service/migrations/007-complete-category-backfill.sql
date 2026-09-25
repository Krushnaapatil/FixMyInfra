-- Completes the category -> department backfill started in 006.
--
-- 006 only covered four of the seven categories, so complaints filed as
-- "Fallen tree", "Mosquito breeding" or "Illegal hoarding" kept a NULL
-- department_id and were never routed to the department that owns them.
--
-- Idempotent: only touches rows with a NULL department_id.
-- Apply as the database owner (see 005-create-outbox-events.sql).
UPDATE complaints SET department_id = '55555555-5555-4555-8555-555555555555'
  WHERE department_id IS NULL AND lower(category) = lower('Fallen tree');
UPDATE complaints SET department_id = '66666666-6666-4666-8666-666666666666'
  WHERE department_id IS NULL AND lower(category) = lower('Mosquito breeding');
UPDATE complaints SET department_id = '77777777-7777-4777-8777-777777777777'
  WHERE department_id IS NULL AND lower(category) = lower('Illegal hoarding');

-- Categories outside the catalogue (the API now rejects these, but rows written
-- before that validation existed can still be present) cannot be routed
-- automatically because there is no correct department to infer. They are
-- reported rather than guessed at, so an operator can triage them by hand.
DO $$
DECLARE
  unrouted bigint;
BEGIN
  SELECT count(*) INTO unrouted FROM complaints WHERE department_id IS NULL;
  IF unrouted > 0 THEN
    RAISE NOTICE 'complaints still unrouted: % (categories outside the catalogue)', unrouted;
  END IF;
END $$;
