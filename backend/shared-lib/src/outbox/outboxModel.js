import { DataTypes } from 'sequelize';

// Transactional Outbox pattern: each service writes domain events to this table
// in the SAME transaction as its business write, then a poller/CDC process
// publishes them to RabbitMQ - guarantees no event is lost if the broker is down.
export function defineOutboxModel(sequelize) {
  return sequelize.define('OutboxEvent', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    aggregateType: { type: DataTypes.STRING, allowNull: false },
    aggregateId: { type: DataTypes.STRING, allowNull: false },
    eventType: { type: DataTypes.STRING, allowNull: false },
    payload: { type: DataTypes.JSONB, allowNull: false },
    published: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'outbox_events',
    timestamps: false
  });
}

export const OutboxEvent = null; // placeholder export kept for named-import symmetry
