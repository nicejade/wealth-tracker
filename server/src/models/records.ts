import { DataTypes, Model } from 'sequelize'
import { sequelize } from './index'

export class Record extends Model {}

Record.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    risk: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'LOW',
    },
    liquidity: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'GOOD',
    },
    currency: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Record',
    tableName: 'record',
    timestamps: false,
  },
)
