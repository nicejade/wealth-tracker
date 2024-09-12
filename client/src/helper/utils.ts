import dayjs from 'dayjs'

export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay || 1000))

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
