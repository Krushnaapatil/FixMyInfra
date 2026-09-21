-- Transactional outbox for complaint-service domain events.
-- The service writes here in the SAME transaction as the complaint write;
-- a poller publishes unpublished rows to RabbitMQ, so no event is lost
-- when the broker is down.
-- Apply as the database owner (e.g. psql -U postgres), because the
-- fixmyinfra role has no CREATE privilege on the public schema.
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbox_events_unpublished
  ON outbox_events (published, created_at)
  WHERE published = FALSE;

GRANT USAGE ON SCHEMA public TO fixmyinfra;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.outbox_events TO fixmyinfra;
