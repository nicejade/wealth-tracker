import { get } from 'svelte/store'
import { checkPassword } from './apis'
import { isAuthenticated, isLoading, isResettable, isPasswordAllowed } from '../stores'
import { sha256Bytes } from './sha256'

export const initializeAuth = async () => {
  if (!get(isLoading)) {
    isLoading.set(true)
  }

  try {
    const { canBeReset, allowPassword, havePassword, needPassword } = (await checkPassword()) as any
    isResettable.set(canBeReset)
    isAuthenticated.set(!needPassword)
    isPasswordAllowed.set(allowPassword || havePassword)
  } catch (error) {
    console.error('Failed to check password status:', error)
    isAuthenticated.set(true)
  } finally {
    isLoading.set(false)
  }
}

/**
 * Pre-hash password before sending to the server.
 * Prefer Web Crypto when available; fall back to pure JS SHA-256 so HTTP
 * (non-secure) and HTTPS contexts always produce the same value.
 * Never return plaintext — that caused Invalid password across contexts.
 */
export async function hashPassword(password: string): Promise<string> {
  const hashArray = await digestSha256(password)
  const passwordHash = btoa(String.fromCharCode(...hashArray))
  return JSON.stringify(passwordHash)
}

async function digestSha256(password: string): Promise<number[]> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(password)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hashBuffer))
    } catch (error) {
      console.warn('Web Crypto digest failed, using pure JS SHA-256:', error)
    }
  }

  return Array.from(sha256Bytes(new TextEncoder().encode(password)))
}
