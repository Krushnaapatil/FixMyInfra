-- Normalises stored category values to the canonical catalogue spelling.
--
-- The API used to persist whatever string the client sent, so "  gArBaGe  "
-- became its own category alongside "Garbage". That splits the category across
-- reporting (the admin donut, per-category counts) and breaks exact-match
-- lookups. Writes are now canonicalised in the service; this cleans up history.
--
-- Idempotent: the WHERE clause only matches rows that differ from the
-- canonical spelling.
-- Apply as the database owner (see 005-create-outbox-events.sql).
UPDATE complaints SET category = 'Road damage'        WHERE lower(btrim(category)) = lower('Road damage')        AND category <> 'Road damage';
UPDATE complaints SET category = 'Water and drainage' WHERE lower(btrim(category)) = lower('Water and drainage') AND category <> 'Water and drainage';
UPDATE complaints SET category = 'Garbage'            WHERE lower(btrim(category)) = lower('Garbage')            AND category <> 'Garbage';
UPDATE complaints SET category = 'Streetlight'        WHERE lower(btrim(category)) = lower('Streetlight')        AND category <> 'Streetlight';
UPDATE complaints SET category = 'Fallen tree'        WHERE lower(btrim(category)) = lower('Fallen tree')        AND category <> 'Fallen tree';
UPDATE complaints SET category = 'Mosquito breeding'  WHERE lower(btrim(category)) = lower('Mosquito breeding')  AND category <> 'Mosquito breeding';
UPDATE complaints SET category = 'Illegal hoarding'  WHERE lower(btrim(category)) = lower('Illegal hoarding')  AND category <> 'Illegal hoarding';

-- Anything left is a category outside the catalogue, which the API now rejects.
-- Reported rather than deleted: an operator should decide, not a migration.
DO $$
DECLARE
  offenders text;
BEGIN
  SELECT string_agg(DISTINCT category, ', ') INTO offenders
    FROM complaints
   WHERE lower(btrim(category)) NOT IN (
     lower('Road damage'), lower('Water and drainage'), lower('Garbage'),
     lower('Streetlight'), lower('Fallen tree'), lower('Mosquito breeding'),
     lower('Illegal hoarding')
   );
  IF offenders IS NOT NULL THEN
    RAISE NOTICE 'complaints with out-of-catalogue categories need triage: %', offenders;
  END IF;
END $$;
