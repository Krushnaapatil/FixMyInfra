import amqp from 'amqplib';

let channel;

export async function getChannel() {
  if (channel) return channel;
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
  channel = await conn.createChannel();
  return channel;
}

// Publishes an outbox event to its topic exchange.
// Naming convention: fixmyinfra.<aggregateType>.<eventType>
// e.g. fixmyinfra.complaint.status_changed
export async function publishEvent(exchange, routingKey, payload) {
  const ch = await getChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
}
