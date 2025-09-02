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
  return bcrypt.compare(saltedPassword, hash)
}

export default Password
