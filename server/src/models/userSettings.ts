import { DataTypes, Model } from 'sequelize'
import { sequelize } from './index'

class UserSettings extends Model {
  declare id: number
  declare theme: string
  declare language: string
  declare targetCurrency: string
  declare exchangeRateApiKey: string
  declare bitcoinApiKey: string
  declare apiKey: string
  declare baseURL: string
  declare model: string
  declare temperature: number
}

UserSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'light',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'zh-CN',
    },
    targetCurrency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'CNY',
    },
    exchangeRateApiKey: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    bitcoinApiKey: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    baseURL: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://api.x.ai/v1/',
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'grok-beta',
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.7,
    },
  },
  {
    sequelize,
    modelName: 'UserSettings',
  },
)

export default UserSettings
