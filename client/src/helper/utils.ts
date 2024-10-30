import dayjs from 'dayjs'
import { LANG_ARR, STORAGE_LANG, DEFAULT_LANG } from './../helper/constant'

export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay || 1000))

export const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min
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
