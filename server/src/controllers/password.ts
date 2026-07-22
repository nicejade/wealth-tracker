import { FastifyReply, FastifyRequest } from 'fastify'
import Password, {
  hash,
  normalizePasswordInput,
  verifyPasswordCandidates,
} from '../models/password'
import { createSession, validateSession } from '../models/session'
import { parseBooleanEnv } from '../helper/constant'

/**
 * Detect whether the incoming request was made over HTTPS,
 * either directly or through a reverse proxy (e.g. Nginx).
 */
const isRequestSecure = (request: FastifyRequest): boolean => {
  return request.protocol === 'https' || request.headers['x-forwarded-proto'] === 'https'
}

/**
 * Build a consistent cookie options object based on the current request context.
 */
const buildSessionCookieOptions = (request: FastifyRequest) => {
  const secure = isRequestSecure(request)
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  }
}

export const checkPassword = async (request: FastifyRequest) => {
  const canBeReset = parseBooleanEnv(process.env.CAN_BE_RESET, false)
  const allowPassword = parseBooleanEnv(process.env.ALLOW_PASSWORD, false)
  const havePassword = !!(await Password.findOne({ where: {} }))

  if (!allowPassword) {
    return { allowPassword, needPassword: false, havePassword, canBeReset }
  }

  const sessionId = request.cookies.sessionId
  if (sessionId) {
    const isValid = await validateSession(sessionId)
    if (isValid) {
      return { allowPassword, needPassword: false, havePassword, canBeReset }
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

  // Always store the canonical client-style prehash so login works from
  // both HTTPS and plain HTTP (Web Crypto is unavailable on non-secure origins).
  const hashStr = await hash(normalizePasswordInput(password))

  if (existingPassword) {
    await existingPassword.update({ hash: hashStr })
  } else {
    await Password.create({ hash: hashStr })
  }

  // Create a session so the user stays authenticated after setting the password,
  // avoiding being immediately locked out and prompted to re-enter.
  const sessionId = await createSession()
  reply.setCookie('sessionId', sessionId, buildSessionCookieOptions(request))

  return { success: true }
}

export const verifyPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { password } = request.body as { password: string }
  const storedPassword = await Password.findOne({ where: {} })

  if (!storedPassword) {
    return reply.code(400).send({ error: 'No password set' })
  }

  // Accept plaintext or legacy client prehash so HTTP / HTTPS logins both work
  // against passwords set from either context (see issue #42).
  const isValid = await verifyPasswordCandidates(password, storedPassword.hash)
  if (!isValid) {
    return reply.code(401).send({ message: 'Invalid password' })
  }

  const sessionId = await createSession()

  // Set HTTP Only Cookie — secure flag is auto-detected from actual protocol
  reply.setCookie('sessionId', sessionId, buildSessionCookieOptions(request))

  return { success: true }
}
