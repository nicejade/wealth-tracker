import { DataTypes, Model, Op } from 'sequelize'
import { sequelize } from './index'
import crypto from 'crypto'

class Session extends Model {
  declare id: string
  declare expiresAt: Date
}

Session.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Session',
  },
)

export const createSession = async (): Promise<string> => {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 分钟有效期

  await Session.create({
    id: sessionId,
    expiresAt,
  })

  return sessionId
}

export const validateSession = async (sessionId: string): Promise<boolean> => {
  const session = await Session.findByPk(sessionId)
  if (!session) return false

  const now = new Date()
  if (now > session.expiresAt) {
    await session.destroy()
    return false
  }

  return true
}

export const clearExpiredSessions = async () => {
  const now = new Date()
  await Session.destroy({
    where: {
      expiresAt: {
        [Op.lt]: now,
      },
    },
  })
}

export default Session
