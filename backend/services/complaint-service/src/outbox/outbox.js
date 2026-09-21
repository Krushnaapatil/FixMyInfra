import { defineOutboxModel, publishEvent } from '@fixmyinfra/shared-lib';
import { sequelize } from '../db/sequelize.js';

export const OutboxEvent = defineOutboxModel(sequelize);

const EXCHANGE = 'fixmyinfra.events';

// False when migrations/005 has not been applied (or the DB role cannot
// access outbox_events). Routes then persist the business write without an
// outbox row and log a warning instead of failing the request.
export let outboxEnabled = false;

export async function initOutbox() {
  try {
    await OutboxEvent.sync();
    await OutboxEvent.findAll({ limit: 0 });
    outboxEnabled = true;
    console.log('complaint-service outbox enabled');
  } catch (error) {
    outboxEnabled = false;
    console.error(
      'complaint-service outbox DISABLED (apply migrations/005-create-outbox-events.sql as the DB owner):',
      error.message
    );
  }
}

export async function writeOutboxEvent(transaction, { aggregateType, aggregateId, eventType, payload }) {
  await OutboxEvent.create(
    { aggregateType, aggregateId, eventType, payload, published: false },
    { transaction }
  );
}

async function publishOne(event) {
  await publishEvent(
    EXCHANGE,
    `fixmyinfra.${event.aggregateType}.${event.eventType}`,
    {
      id: event.id,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payload: event.payload
    }
  );
  await event.update({ published: true });
}

// Best-effort publisher: never throws. When the broker is down the rows
// stay unpublished and are retried on the next poll.
export async function publishPendingEvents(limit = 50) {
  if (!outboxEnabled) return;
  let events;
  try {
    events = await OutboxEvent.findAll({
      where: { published: false },
      order: [['createdAt', 'ASC']],
      limit
    });
  } catch (error) {
    console.error('Outbox poll failed to read pending events:', error.message);
    return;
  }

  for (const event of events) {
    try {
      await publishOne(event);
    } catch (error) {
      console.error('Outbox poll could not publish event, will retry:', error.message);
      return;
    }
  }
}

export function startOutboxPoller(intervalMs = 15000) {
  const timer = setInterval(() => {
    void publishPendingEvents();
  }, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  return timer;
}
