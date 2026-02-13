import { FastifyReply, FastifyRequest } from 'fastify'
import Password, { hash, verify } from '../models/password'
import { createSession, validateSession } from '../models/session'

export const checkPassword = async (request: FastifyRequest) => {
  const canBeReset = process.env.CAN_BE_RESET === 'true'
  const allowPassword = process.env.ALLOW_PASSWORD === 'true'
  const havePassword = !!(await Password.findOne({ where: {} }))

  if (!allowPassword) {
    return { allowPassword, needPassword: false, havePassword, canBeReset }
  }

  const sessionId = request.cookies.sessionId
  if (sessionId) {
    const isValid = await validateSession(sessionId)
    if (isValid) {
      return { allowPassword, needPassword: false, havePassword, canBeReset } // 会话有效，视为已通过验证
    }
  }

  return { allowPassword, needPassword: havePassword, havePassword, canBeReset }
}

export const setPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { password } = request.body as { password: string }
  const existingPassword = await Password.findOne({ where: {} })

  if (typeof password !== 'string' || !password.trim()) {
    return reply.code(400).send({ message: 'Password is required' })
  }

  // If password already exists, only authenticated session can update it.
  if (existingPassword) {
    const sessionId = request.cookies.sessionId
    if (!sessionId || !(await validateSession(sessionId))) {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
  }

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

  // 修复跨平台迁移问题：去除 hash 值中可能存在的空白字符
  const cleanHash = storedPassword.hash.trim()
  const isValid = await verify(password, cleanHash)
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
