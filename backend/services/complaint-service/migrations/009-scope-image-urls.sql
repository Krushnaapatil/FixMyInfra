-- Clears evidence URLs that predate the /api/media allowlist.
--
-- The API now only accepts image paths minted by the upload endpoint, because an
-- arbitrary client-supplied URL makes an officer's browser load an
-- attacker-controlled host. Rows written before that rule can still hold
-- external URLs such as "http://example.com/p.jpg".
--
-- Idempotent: the WHERE clause only matches rows that would now be rejected.
-- Apply as the database owner (see 005-create-outbox-events.sql).
UPDATE complaints
   SET image_url = NULL
 WHERE image_url IS NOT NULL
   AND image_url !~ '^/api/media/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|heic)$';

-- Reported rather than guessed at: an operator can decide whether the evidence
-- should be re-uploaded or the row discarded.
DO $$
DECLARE
  affected text;
BEGIN
  SELECT count(*)::text INTO affected FROM complaints WHERE image_url IS NOT NULL;
  RAISE NOTICE 'complaints with a compliant image_url remaining: %', affected;
END $$;
