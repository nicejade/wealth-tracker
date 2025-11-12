import { DataTypes, Model } from 'sequelize'
import { sequelize } from './index'

class CustomCurrency extends Model {
  declare id: number
  declare code: string
  declare symbol: string
  declare name: string
  declare exchangeRate: number
  declare isActive: boolean
}

CustomCurrency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 10],
        isUppercase: true,
      },
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 10],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false,
      defaultValue: 1,
      comment: '汇率：相对于基准货币（CNY）的汇率，1 CNY = exchangeRate 自定义货币',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CustomCurrency',
    tableName: 'custom_currencies',
    timestamps: true,
  },
)

export default CustomCurrency

