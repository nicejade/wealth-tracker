import dayjs from 'dayjs'
import { marked } from 'marked'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { LANG_ARR, STORAGE_LANG, DEFAULT_LANG } from './../helper/constant'

const renderer: any = new marked.Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
  const html = linkRenderer.call(renderer, href, title, text)
  return html.replace(/^<a /, `<a target="_blank" rel="noopener noreferrer"`)
}

marked.setOptions({ renderer })

export const parse = marked.parse

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
  const storedLang = localStorage.getItem(STORAGE_LANG)
  if (storedLang && isValidLang(storedLang)) {
    return storedLang
  }

  const browserLang = navigator.language.toLowerCase()
  const matchedLang = LANG_ARR.find((lang) => browserLang.startsWith(lang.value.toLowerCase()))

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
 * @param rawWealthArr Original asset data arr.
 * @param extent The starting date string.
 * @returns Filled-in completed asset data.
 */
export const fillMissingWealthArr = (rawWealthArr, start) => {
  const length = rawWealthArr.length
  if (length <= 1) return rawWealthArr
  const { type, datetime } = rawWealthArr[0]

  const startDateTime = dayjs(datetime).isBefore(start) ? datetime : start
  const serialDateArray = generateDatesArray(startDateTime)
  const filledWealthArr = []
  serialDateArray.forEach((date, index) => {
    let targetItem = rawWealthArr.find((item) => item.datetime === date)
    if (!targetItem) {
      if (index === 0) {
        filledWealthArr.push({
          type,
          amount: 0,
          datetime: date,
        })
      } else {
        let lastItem = filledWealthArr[filledWealthArr.length - 1]
        filledWealthArr.push({ ...lastItem, datetime: date })
      }
    } else {
      filledWealthArr.push(targetItem)
    }
  })
  return filledWealthArr
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
