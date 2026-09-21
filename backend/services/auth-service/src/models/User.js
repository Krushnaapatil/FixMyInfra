import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('CITIZEN', 'OFFICER', 'ADMIN'),
    allowNull: false,
    defaultValue: 'CITIZEN'
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true
});
