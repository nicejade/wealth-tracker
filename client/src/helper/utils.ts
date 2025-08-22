import dayjs from 'dayjs'
import { marked } from 'marked'
import { get } from 'svelte/store'
import { _ } from 'svelte-i18n'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import {
  LANG_ARR,
  STORAGE_LANG,
  DEFAULT_LANG,
  DEFAULT_EXCHANGE_RATE,
  EXCHANGE_RATE_API_KEY,
  BITCOIN_API_KEY,
  TARGET_CURRENCY,
} from './../helper/constant'
import { exchangeRates } from './../stores'

const renderer: any = new marked.Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
  const html = linkRenderer.call(renderer, href, title, text)
  return html.replace(/^<a /, `<a target="_blank" rel="noopener noreferrer"`)
}

marked.setOptions({ renderer })

export const parse = (src: string): string => marked.parse(src) as string

export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay || 1000))

export const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min
}

export const isNeedScroll = () => {
  const OFFSET_LIMIT = 150
  const offsetSpaceNum = window.document.body.scrollHeight - window.innerHeight
  return offsetSpaceNum > OFFSET_LIMIT
}

const isValidLang = (lang: string): boolean => {
  return LANG_ARR.some((item) => item.value === lang)
}

export const getAppLang = (): string => {
  // 1. 优先使用URL参数中的语言
  const urlParams = new URLSearchParams(window.location.search)
  const urlLang = urlParams.get('lang')
  if (urlLang && isValidLang(urlLang)) {
    return urlLang
  }

  // 2. 其次使用localStorage存储的语言
  const storedLang = localStorage.getItem(STORAGE_LANG)
  if (storedLang && isValidLang(storedLang)) {
    return storedLang
  }

  // 3. 再次使用浏览器语言
  const browserLang = navigator.language.toLowerCase()
  const matchedLang = LANG_ARR.find((lang) => browserLang.startsWith(lang.value.toLowerCase()))

  // 4. 最后使用默认语言
  return matchedLang ? matchedLang.value : DEFAULT_LANG
}

export function deepClone(obj: Object) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}

export const sortByDatetime = (params) => {
  return params.sort((a, b) => {
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  })
}

export const generateDatesArray = (datetime: string) => {
  let start = dayjs(datetime)
  let daysArray = []

  let current = start
  while (current.isBefore(dayjs())) {
    daysArray.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return daysArray
}

/**
 * @desc Fill in the missing asset record data.
 * @param rawAssetsArr Original asset data arr.
 * @param extent The starting date string.
 * @returns Filled-in completed asset data.
 */
export const fillMissingAssetsArr = (rawAssetsArr, start) => {
  const length = rawAssetsArr.length
  if (length <= 1) return rawAssetsArr
  const { type, datetime } = rawAssetsArr[0]

  const startDateTime = dayjs(datetime).isBefore(start) ? datetime : start
  const serialDateArray = generateDatesArray(startDateTime)
  const filledAssetsArr = []
  serialDateArray.forEach((date, index) => {
    let targetItem = rawAssetsArr.find((item) => item.datetime === date)
    if (!targetItem) {
      if (index === 0) {
        filledAssetsArr.push({
          type,
          amount: 0,
          datetime: date,
        })
      } else {
        let lastItem = filledAssetsArr[filledAssetsArr.length - 1]
        filledAssetsArr.push({ ...lastItem, datetime: date })
      }
    } else {
      filledAssetsArr.push(targetItem)
    }
  })
  return filledAssetsArr
}

export const groupArrayByType = (array, type = 'type') => {
  const grouped = array.reduce((arr, item) => {
    if (!arr[item[type]]) {
      arr[item[type]] = []
    }
    arr[item[type]].push(item)
    return arr
  }, {})
  return Object.entries(grouped).map(([type, array]) => ({ type, array }))
}

export const fineTuningArrayLen = (sources) => {
  const SOURCES_LEN = sources.length
  const SHORT_STEP = 7
  const LONG_STEP = 28
  if (SOURCES_LEN <= LONG_STEP) {
    return sources
  }

  const THRESHOLD_VALUE = LONG_STEP * SHORT_STEP
  const STEP_LEN = SOURCES_LEN < THRESHOLD_VALUE ? SHORT_STEP : LONG_STEP
  const segs = Math.ceil(sources.length / STEP_LEN)
  return Array.from({ length: segs }, (_, idx) => {
    const target = (idx + 1) * STEP_LEN - 1
    return sources[target]
  })
}

export const computeChangePercent = (series) => {
  const lastSeries = series.map((item) => item.data).map((item) => item[item.length - 1])
  const lastSeriesSum = lastSeries.reduce((acc, cur) => acc + cur, 0)

  // Find first non-zero sum by checking each time point
  let firstSeriesSum = 0
  let itemIndex = 0
  const DATA_LENGTH = series[0].data.length
  while (firstSeriesSum === 0 && itemIndex < DATA_LENGTH) {
    firstSeriesSum = series.reduce((acc, cur) => acc + (cur.data[itemIndex] || 0), 0)
    itemIndex++
  }

  // If all values are zero, set percentage to 0 to avoid division by zero
  return firstSeriesSum === 0 ? 0 : ((lastSeriesSum - firstSeriesSum) / firstSeriesSum) * 100
}

/**
 * 根据索引和偏移天数计算日期
 * @param reverseIndex 反向索引（最近的日期索引最大）
 * @param offsetDays 偏移天数
 * @returns 计算得到的日期，格式为 'YYYY-MM-DD'
 */
export const calculateDateByOffset = (reverseIndex: number, offsetDays: number): string => {
  const today = dayjs()
  const SHORT_STEP = 7
  const LONG_STEP = 28
  const THRESHOLD_VALUE = LONG_STEP * SHORT_STEP
  let daysToSubtract: number

  if (offsetDays >= THRESHOLD_VALUE) {
    daysToSubtract = (offsetDays / LONG_STEP - reverseIndex) * LONG_STEP
  } else {
    daysToSubtract = (offsetDays / SHORT_STEP - reverseIndex) * SHORT_STEP
  }

  return today.subtract(Math.floor(daysToSubtract), 'day').format('YYYY-MM-DD')
}

/**
 * 更新页面的 meta 信息
 * @param options 配置项
 * @param options.title 页面标题，将与 appTitle 组合
 * @param options.description 页面描述，如不提供则默认使用 appDesc 的多语言文本
 */
export const updatePageMetaInfo = (options: { title?: string; description?: string }) => {
  const pageTitle = options.title ? `${options.title} | ${get(_)('appTitle')}` : get(_)('appTitle')
  document.title = pageTitle

  const metaTitleElements = document.querySelectorAll(
    'meta[name="title"], meta[property="og:title"], meta[property="twitter:title"]',
  )
  metaTitleElements.forEach((element) => {
    element.setAttribute('content', pageTitle)
  })

  const description = options.description || get(_)('appDesc')
  const metaDescElements = document.querySelectorAll(
    'meta[name="description"], meta[property="og:description"], meta[property="twitter:description"]',
  )
  metaDescElements.forEach((element) => {
    element.setAttribute('content', description)
  })
}

export const genAdviceWithStream = (params, options) => {
  const REQUEST_TIMEOUT_MS = 60000
  const requestTimeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let controller = new AbortController()
  const finish = () => {
    controller?.abort()
    controller = undefined
  }
  controller.signal.onabort = finish

  fetchEventSource('/api/generate-advice', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },

    cache: 'no-cache',

    signal: controller.signal,

    body: JSON.stringify(params),

    async onopen(response) {
      clearTimeout(requestTimeoutId)
      const contentType = response.headers.get('content-type')

      if (!response.ok) {
        console.error(`[@genAdviceWithStream] Response not OK:`, {
          status: response.status,
          statusText: response.statusText,
        })
        options?.onError({
          statusCode: response.status,
          message: response.statusText,
        })
        return finish()
      }

      if (!contentType?.startsWith(EventStreamContentType)) {
        console.error(`[@genAdviceWithStream] Invalid content type:`, contentType)
        options?.onError({
          statusCode: 400,
          message: `Invalid content type: ${contentType}`,
        })
        return finish()
      }

      return Promise.resolve()
    },

    async onmessage(msg) {
      if (msg.data === '[DONE]' || msg.data.startsWith('[DONE]')) {
        console.log(`[@genAdviceWithStream] Stream completed`)
        options?.onFinish()
        return finish()
      }

      try {
        options.onUpdate(JSON.parse(msg.data))
      } catch (err) {
        console.log(`[@genAdviceWithStream] Error ${err.message}`)
        options?.onError({
          statusCode: 400,
          message: 'Failed to parse server response',
        })
      }
    },

    onclose() {
      console.log(`[@genAdviceWithStream] Event Stream Request Have Close.`)
      finish()
    },

    onerror(error) {
      console.log(`[@genAdviceWithStream] Error：`, error.message)
      options?.onError(error)
      finish()
    },

    openWhenHidden: true,
  })
}

/* 获取实时汇率数据 这里使用 ExchangeRate-API
  你需要注册一个 API key: https://www.exchangerate-api.com/
*/
const EXCHANGE_RATE_CACHE_KEY = 'exchange-rate-cache'

const getCachedRates = (base: string) => {
  const cached = sessionStorage.getItem(EXCHANGE_RATE_CACHE_KEY)
  if (!cached) return null

  const CACHE_EXPIRY_TIME = 12 * 60 * 60 * 1000
  const { rates, timestamp, cacheBase } = JSON.parse(cached)
  const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME
  return !isExpired && cacheBase === base ? rates : null
}

const setCachedRates = (rates: any, base: string) => {
  sessionStorage.setItem(
    EXCHANGE_RATE_CACHE_KEY,
    JSON.stringify({
      rates,
      timestamp: Date.now(),
      cacheBase: base,
    }),
  )
}

export const getStoredCurrency = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TARGET_CURRENCY) || 'CNY'
  }
  return 'CNY'
}

export const setStoredCurrency = (currency: string = 'CNY') => {
  return localStorage.setItem(TARGET_CURRENCY, currency)
}

const fetchLatestRates = async (rateApiKey: string, base: string) => {
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${rateApiKey}/latest/${base}`)
  if (!response.ok) {
    console.error('Exchangerate API request failed:', response.status, response.statusText)
    return null
  }
  const result = await response.json()
  return result.conversion_rates
}

const fetchBitcoinPrice = async (apiKey: string): Promise<number | null> => {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/bitcoin', {
      headers: {
        'X-Api-Key': apiKey,
      },
    })

    if (!response.ok) {
      console.error('Bitcoin API request failed:', response.status, response.statusText)
      return null
    }

    const result = await response.json()
    return parseFloat(result.price)
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error)
    return null
  }
}

export async function fetchExchangeRates(base = 'CNY') {
  try {
    const cachedRates = getCachedRates(base)
    if (cachedRates) {
      exchangeRates.set(cachedRates)
      return
    }

    const rateApiKey = localStorage.getItem(EXCHANGE_RATE_API_KEY)
    if (!rateApiKey) {
      const rates = { ...DEFAULT_EXCHANGE_RATE.conversion_rates }
      exchangeRates.set(rates)
      return
    }

    const rates = await fetchLatestRates(rateApiKey, base)
    const bitcoinApiKey = localStorage.getItem(BITCOIN_API_KEY)
    if (bitcoinApiKey) {
      const bitcoinPriceUSD = await fetchBitcoinPrice(bitcoinApiKey)
      if (bitcoinPriceUSD !== null && rates['USD'] && rates[base]) {
        const btcInBase = rates['USD'] / bitcoinPriceUSD
        rates.BTC = Number(btcInBase.toFixed(10))
      }
    }

    setCachedRates(rates, base)
    exchangeRates.set(rates)
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    const rates = { ...DEFAULT_EXCHANGE_RATE.conversion_rates }
    exchangeRates.set(rates)
  }
}

export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
    return amount
  }
  // 先转换到基准货币，再转换到目标货币
  const baseAmount = amount / rates[fromCurrency]
  return Number((baseAmount * rates[toCurrency]).toFixed(2))
}
