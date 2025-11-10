import { getUserSettings, updateUserSettings } from './apis'
import { theme, language, targetCurrencyCode } from '../stores'
import {
  STORAGE_THEME,
  STORAGE_LANG,
  TARGET_CURRENCY,
  EXCHANGE_RATE_API_KEY,
  BITCOIN_API_KEY,
  DEFAULT_THEME,
  DEFAULT_LANG,
} from './constant'

let settingsCache: any = null
let isLoading = false
let loadPromise: Promise<any> | null = null

/**
 * 从服务器加载用户设置
 */
export const loadUserSettings = async (): Promise<any> => {
  // 如果正在加载，返回同一个 Promise
  if (isLoading && loadPromise) {
    return loadPromise
  }

  // 如果已经缓存，直接返回
  if (settingsCache) {
    return settingsCache
  }

  isLoading = true
  loadPromise = (async () => {
    try {
      const response: any = await getUserSettings()
      if (response.success && response.data) {
        settingsCache = response.data
        // 应用设置到 stores 和 localStorage（作为 fallback）
        applySettings(settingsCache)
        return settingsCache
      }
      // 如果服务器没有设置，返回默认值
      return getDefaultSettings()
    } catch (error) {
      console.error('Failed to load user settings:', error)
      // 如果加载失败，尝试从 localStorage 读取（向后兼容）
      return loadFromLocalStorage()
    } finally {
      isLoading = false
      loadPromise = null
    }
  })()

  return loadPromise
}

/**
 * 从 localStorage 加载设置（向后兼容）
 */
const loadFromLocalStorage = () => {
  const localSettings = {
    theme: localStorage.getItem(STORAGE_THEME) || DEFAULT_THEME,
    language: localStorage.getItem(STORAGE_LANG) || DEFAULT_LANG,
    targetCurrency: localStorage.getItem(TARGET_CURRENCY) || 'CNY',
    exchangeRateApiKey: localStorage.getItem(EXCHANGE_RATE_API_KEY) || '',
    bitcoinApiKey: localStorage.getItem(BITCOIN_API_KEY) || '',
    apiKey: localStorage.getItem('apiKey') || '',
    baseURL: localStorage.getItem('baseURL') || 'https://api.x.ai/v1/',
    model: localStorage.getItem('model') || 'grok-beta',
    temperature: parseFloat(localStorage.getItem('temperature') || '0.7'),
  }
  settingsCache = localSettings
  applySettings(localSettings)
  return localSettings
}

/**
 * 应用设置到 stores 和 localStorage
 */
const applySettings = (settings: any) => {
  // 应用主题
  if (settings.theme) {
    theme.set(settings.theme)
    localStorage.setItem(STORAGE_THEME, settings.theme)
  }

  // 应用语言
  if (settings.language) {
    language.set(settings.language)
    localStorage.setItem(STORAGE_LANG, settings.language)
  }

  // 应用货币
  if (settings.targetCurrency) {
    targetCurrencyCode.set(settings.targetCurrency)
    localStorage.setItem(TARGET_CURRENCY, settings.targetCurrency)
  }

  // 应用 API Keys（存储到 localStorage 作为 fallback）
  if (settings.exchangeRateApiKey !== undefined) {
    localStorage.setItem(EXCHANGE_RATE_API_KEY, settings.exchangeRateApiKey || '')
  }
  if (settings.bitcoinApiKey !== undefined) {
    localStorage.setItem(BITCOIN_API_KEY, settings.bitcoinApiKey || '')
  }
  if (settings.apiKey !== undefined) {
    localStorage.setItem('apiKey', settings.apiKey || '')
  }
  if (settings.baseURL !== undefined) {
    localStorage.setItem('baseURL', settings.baseURL || '')
  }
  if (settings.model !== undefined) {
    localStorage.setItem('model', settings.model || '')
  }
  if (settings.temperature !== undefined) {
    localStorage.setItem('temperature', String(settings.temperature))
  }
}

/**
 * 获取默认设置
 */
const getDefaultSettings = () => {
  return {
    theme: DEFAULT_THEME,
    language: DEFAULT_LANG,
    targetCurrency: 'CNY',
    exchangeRateApiKey: '',
    bitcoinApiKey: '',
    apiKey: '',
    baseURL: 'https://api.x.ai/v1/',
    model: 'grok-beta',
    temperature: 0.7,
  }
}

/**
 * 更新用户设置到服务器
 */
export const saveUserSettings = async (updates: Partial<any>): Promise<boolean> => {
  try {
    // 更新本地缓存
    if (!settingsCache) {
      settingsCache = await loadUserSettings()
    }

    // 合并更新
    settingsCache = { ...settingsCache, ...updates }

    // 应用设置到 stores 和 localStorage
    applySettings(updates)

    // 同步到服务器
    const response: any = await updateUserSettings(updates)
    if (response.success) {
      if (response.data) {
        settingsCache = response.data
        applySettings(response.data)
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to save user settings:', error)
    // 即使服务器保存失败，也更新本地缓存和 localStorage（作为 fallback）
    applySettings(updates)
    return false
  }
}
