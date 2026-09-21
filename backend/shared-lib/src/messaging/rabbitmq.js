import amqp from 'amqplib';

let channel;
let connection;

function rabbitmqUrl() {
  return process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
}

function resetOnClose(emitter) {
  emitter.on('error', () => {
    channel = undefined;
    connection = undefined;
  });
  emitter.on('close', () => {
    channel = undefined;
    connection = undefined;
  });
}

export async function getChannel() {
  if (channel) return channel;
  const conn = await amqp.connect(rabbitmqUrl());
  connection = conn;
  resetOnClose(conn);
  channel = await conn.createChannel();
  resetOnClose(channel);
  return channel;
}

// Publishes an outbox event to its topic exchange.
// Naming convention: fixmyinfra.<aggregateType>.<eventType>
// e.g. fixmyinfra.complaint.status_changed
// Throws when the broker is unreachable; callers that must not fail the
// HTTP request (e.g. outbox pollers, best-effort publishers) should catch.
export async function publishEvent(exchange, routingKey, payload) {
  const ch = await getChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

export async function closeMessaging() {
  try {
    await channel?.close();
  } catch {
    // ignore close errors during shutdown
  }
  try {
    await connection?.close();
  } catch {
    // ignore close errors during shutdown
  }
  channel = undefined;
  connection = undefined;
}
