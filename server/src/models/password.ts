import { DataTypes, Model } from 'sequelize'
import { sequelize } from './index'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

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

/**
 * Reproduce the legacy browser hashPassword output:
 * JSON.stringify(btoa(SHA-256(utf8(password))))
 * so HTTPS-set and HTTP-set passwords can be verified consistently.
 */
export const clientStylePrehash = (password: string): string => {
  const digest = crypto.createHash('sha256').update(password, 'utf8').digest()
  return JSON.stringify(digest.toString('base64'))
}

/** Detect values already pre-hashed by older clients. */
export const looksLikeClientPrehash = (value: string): boolean => {
  if (!value.startsWith('"') || !value.endsWith('"')) return false
  try {
    const inner = JSON.parse(value)
    return typeof inner === 'string' && /^[A-Za-z0-9+/]+=*$/.test(inner) && inner.length === 44
  } catch {
    return false
  }
}

/** Normalize incoming password to the canonical prehash form before bcrypt. */
export const normalizePasswordInput = (password: string): string => {
  return looksLikeClientPrehash(password) ? password : clientStylePrehash(password)
}

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

/**
 * Verify against stored bcrypt hash, accepting:
 * - plaintext (legacy HTTP non-secure client fallback)
 * - client-style SHA-256 prehash (legacy HTTPS / Web Crypto client)
 * - either form after server-side normalization
 */
export const verifyPasswordCandidates = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const candidates = new Set<string>([password, clientStylePrehash(password)])
  for (const candidate of candidates) {
    if (await verify(candidate, storedHash)) {
      return true
    }
  }
  return false
}

export default Password
