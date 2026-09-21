import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://fixmyinfra:fixmyinfra@localhost:5432/fixmyinfra';

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false
});
