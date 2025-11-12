import { DATE_EXTENT_ARR, DATE_PERIOD_ARR } from './helper/constant'
import { writable } from 'svelte/store'

const createAuthStore = () => {
  const { subscribe, set } = writable(false)
  return {
    subscribe,
    set,
    reset: () => set(false),
  }
}

const createLoadingStore = () => {
  const { subscribe, set } = writable(true)
  return {
    subscribe,
    set,
    reset: () => set(true),
  }
}

export const isAuthenticated = createAuthStore()
export const isLoading = createLoadingStore()
export const isResettable = writable(false)
export const isPasswordAllowed = writable(false)

export const alert = writable('')

export const notice = writable('')

export const theme = writable('')

export const language = writable('zh')

// Time extent of selected wealth trends.
export const extent = writable(DATE_EXTENT_ARR[0])

export const period = writable(DATE_PERIOD_ARR[0])

export const legend = writable({ chartContext: {}, seriesIndex: -1 })

// Total asset value in the target currency
export const totalAssetValue = writable(0)

/* 基于如下 store 来获取实时汇率数据 & 计算汇率 */
export const exchangeRates = writable({})

export const targetCurrencyCode = writable('CNY')

export const targetCurrencyName = writable('')

// Custom currencies store
export const customCurrencies = writable([])
