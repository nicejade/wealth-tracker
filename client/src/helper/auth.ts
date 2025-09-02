import { get } from 'svelte/store'
import { checkPassword } from './apis'
import { isAuthenticated, isLoading, isResettable, isPasswordAllowed } from '../stores'

export const initializeAuth = async () => {
  if (!get(isLoading)) {
    isLoading.set(true)
  }

  try {
    const { canBeReset, allowPassword, havePassword, needPassword } = (await checkPassword()) as any
    isResettable.set(canBeReset)
    isAuthenticated.set(!needPassword)
    /* 「设置探矿」密码区展示条件：允许开启密码 || 已经设置密码 */
    isPasswordAllowed.set(allowPassword || havePassword)
  } catch (error) {
    console.error('Failed to check password status:', error)
    isAuthenticated.set(false)
  } finally {
    isLoading.set(false)
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      console.log('Current browser does not support - Web Crypto API.')
      return password
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = btoa(String.fromCharCode.apply(null, hashArray))

    return JSON.stringify(passwordHash)
  } catch (error) {
    console.error('Hash Password Error:', error)
    return password
  }
}
