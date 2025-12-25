import { DataTypes, Model } from 'sequelize'
import { sequelize } from './index'
import bcrypt from 'bcrypt'

class Password extends Model {
  declare id: number
  declare hash: string
}

Password.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Password',
  },
)

export const hash = async (password: string): Promise<string> => {
  const pepper = process.env.PEPPER_SECRET || ''
  const saltedPassword = password + pepper
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(saltedPassword, salt)
}

export const verify = async (password: string, hash: string): Promise<boolean> => {
  const pepper = process.env.PEPPER_SECRET || ''
  const saltedPassword = password + pepper
  // 修复跨平台迁移问题：去除 hash 值中可能存在的空白字符
  const cleanHash = hash.trim()
  return bcrypt.compare(saltedPassword, cleanHash)
}

export default Password
