import { DATE_EXTENT_ARR } from './helper/constant'

import { writable } from 'svelte/store'

export const alert = writable('')

export const notice = writable('')

// Time extent of selected wealth trends.
export const extent = writable(DATE_EXTENT_ARR[0])
