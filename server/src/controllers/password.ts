import { FastifyReply, FastifyRequest } from 'fastify'
import Password, { hash, verify } from '../models/password'
import { createSession, validateSession } from '../models/session'

export const checkPassword = async (request: FastifyRequest) => {
  const canBeReset: boolean = !!process.env.CAN_BE_RESET || false
  const allowPassword: boolean = !!process.env.ALLOW_PASSWORD || false

  const havePassword = !!(await Password.findOne({ where: {} }))
  const sessionId = request.cookies.sessionId
  if (sessionId) {
    const isValid = await validateSession(sessionId)
    if (isValid) {
      return { allowPassword, needPassword: false, havePassword, canBeReset } // 会话有效，视为已通过验证
    }
  }

  return { allowPassword, needPassword: havePassword, havePassword, canBeReset }
}

export const setPassword = async (request: FastifyRequest) => {
  const { password } = request.body as { password: string }
  const existingPassword = await Password.findOne({ where: {} })
  const hashStr = await hash(password)

  if (existingPassword) {
    await existingPassword.update({ hash: hashStr })
  } else {
    await Password.create({ hash: hashStr })
  }

  return { success: true }
}

export const verifyPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { password } = request.body as { password: string }
  const storedPassword = await Password.findOne({ where: {} })

  if (!storedPassword) {
    return reply.code(400).send({ error: 'No password set' })
  }

  const isValid = await verify(password, storedPassword.hash)
  if (!isValid) {
    return reply.code(401).send({ message: 'Invalid password' })
  }

  const sessionId = await createSession()

  // Set HTTP Only Cookie
  reply.setCookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 分钟有效期
  })

  return { success: true }
}
