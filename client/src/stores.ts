import { DATE_EXTENT_ARR, DATE_PERIOD_ARR } from './helper/constant'

import { writable } from 'svelte/store'

export const alert = writable('')

export const notice = writable('')

export const theme = writable('')

export const language = writable('zh')

// Time extent of selected wealth trends.
export const extent = writable(DATE_EXTENT_ARR[0])

export const period = writable(DATE_PERIOD_ARR[0])
