import dayjs from 'dayjs'
import { groupArrayByType } from './utils'

/**
 * Report generation utilities.
 *
 * These functions derive a structured monthly / annual wealth report from the
 * `record` time series (already converted into the target currency). They stay
 * currency-agnostic: callers must convert amounts before passing them in.
 */

export type PeriodType = 'month' | 'year'

export interface PeriodAnchors {
  label: string
  currentStart: string
  currentEnd: string
  prevStart: string
  prevEnd: string
}

export interface NetWorthChange {
  start: number
  end: number
  change: number
  changePercent: number | null
}

export interface MoverItem {
  type: string
  alias: string
  start: number
  end: number
  change: number
  changePercent: number | null
}

export interface DistributionDrift {
  key: string
  startShare: number
  endShare: number
  drift: number
}

export interface WealthReport {
  anchors: PeriodAnchors
  netWorth: NetWorthChange
  prevNetWorth: NetWorthChange
  topMovers: MoverItem[]
  riskDrift: DistributionDrift[]
  liquidityDrift: DistributionDrift[]
  hasData: boolean
}

const RISK_ORDER = ['LOW', 'MIDDLE', 'HIGH']
const LIQUIDITY_ORDER = ['GOOD', 'MIDDLE', 'POOR']

/**
 * Compute the anchor dates that bound the current and previous reporting periods.
 *
 * @param periodType `month` or `year`.
 * @param ref Any date within the target period (defaults to today). This makes it
 *   possible to report on a specific past month / year, not just the current one.
 */
export const getPeriodAnchors = (
  periodType: PeriodType,
  ref = dayjs(),
  now = dayjs(),
): PeriodAnchors => {
  const currentStart = ref.startOf(periodType)
  const periodEnd = ref.endOf(periodType)
  // For an ongoing period the "end" is today; for a completed period it is the last day.
  const currentEnd = periodEnd.isAfter(now) ? now : periodEnd
  const prevEnd = currentStart.subtract(1, 'day')
  const prevStart = currentStart.subtract(1, periodType)
  const label = periodType === 'month' ? ref.format('YYYY-MM') : ref.format('YYYY')

  return {
    label,
    currentStart: currentStart.format('YYYY-MM-DD'),
    currentEnd: currentEnd.format('YYYY-MM-DD'),
    prevStart: prevStart.format('YYYY-MM-DD'),
    prevEnd: prevEnd.format('YYYY-MM-DD'),
  }
}

/**
 * Build the list of selectable periods, from the earliest record up to the current
 * period, ordered newest first. Always includes the current period even without data.
 */
export const getAvailablePeriods = (
  records: any[],
  periodType: PeriodType,
  now = dayjs(),
): string[] => {
  const format = periodType === 'month' ? 'YYYY-MM' : 'YYYY'
  const earliest = (records || []).reduce((min, record) => {
    const date = dayjs(record.datetime)
    return date.isValid() && date.isBefore(min) ? date : min
  }, now)

  const periods: string[] = []
  let cursor = now.startOf(periodType)
  const start = earliest.startOf(periodType)
  while (!cursor.isBefore(start)) {
    periods.push(cursor.format(format))
    cursor = cursor.subtract(1, periodType)
  }
  return periods
}

const percentChange = (start: number, end: number): number | null => {
  if (!start) return null
  return ((end - start) / Math.abs(start)) * 100
}

/**
 * Sort a single account's records ascending by business date, then by created time,
 * so that the most recent snapshot for any given day wins.
 */
const sortAscending = (records: any[]): any[] => {
  return [...records].sort((a, b) => {
    const dateDiff = dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf()
    if (dateDiff !== 0) return dateDiff
    return dayjs(a.created || a.datetime).valueOf() - dayjs(b.created || b.datetime).valueOf()
  })
}

/**
 * Return the last snapshot for an account whose business date is on or before `cutoff`.
 * Returns null when the account did not yet exist at that date.
 */
const recordAsOf = (sortedRecords: any[], cutoff: string): any | null => {
  const cutoffTime = dayjs(cutoff).endOf('day')
  let result: any | null = null
  for (const record of sortedRecords) {
    if (!dayjs(record.datetime).isAfter(cutoffTime)) {
      result = record
    } else {
      break
    }
  }
  return result
}

/**
 * Total net worth (positive assets minus liabilities) as of a given date.
 */
export const netWorthAsOf = (groupedRecords: any[], cutoff: string): number => {
  return groupedRecords.reduce((sum, { array }) => {
    const record = recordAsOf(array, cutoff)
    return sum + (record ? Number(record.amount) || 0 : 0)
  }, 0)
}

/**
 * Share of positive assets grouped by a categorical field (risk / liquidity) as of a date.
 * Liabilities (negative amounts) are excluded, matching the allocation donut chart.
 */
const distributionAsOf = (
  groupedRecords: any[],
  cutoff: string,
  field: 'risk' | 'liquidity',
): Record<string, number> => {
  const buckets: Record<string, number> = {}
  let total = 0
  groupedRecords.forEach(({ array }) => {
    const record = recordAsOf(array, cutoff)
    if (!record) return
    const amount = Number(record.amount) || 0
    if (amount <= 0) return
    const key = String(record[field] || '').toUpperCase()
    buckets[key] = (buckets[key] || 0) + amount
    total += amount
  })

  const shares: Record<string, number> = {}
  Object.keys(buckets).forEach((key) => {
    shares[key] = total > 0 ? (buckets[key] / total) * 100 : 0
  })
  return shares
}

const buildDrift = (
  groupedRecords: any[],
  startCutoff: string,
  endCutoff: string,
  field: 'risk' | 'liquidity',
  order: string[],
): DistributionDrift[] => {
  const startShares = distributionAsOf(groupedRecords, startCutoff, field)
  const endShares = distributionAsOf(groupedRecords, endCutoff, field)
  const keys = new Set<string>([...order, ...Object.keys(startShares), ...Object.keys(endShares)])

  return Array.from(keys)
    .filter((key) => (startShares[key] || 0) > 0 || (endShares[key] || 0) > 0)
    .sort((a, b) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
    })
    .map((key) => {
      const startShare = startShares[key] || 0
      const endShare = endShares[key] || 0
      return { key, startShare, endShare, drift: endShare - startShare }
    })
}

const buildTopMovers = (
  groupedRecords: any[],
  startCutoff: string,
  endCutoff: string,
  limit = 3,
): MoverItem[] => {
  return groupedRecords
    .map(({ array }) => {
      const startRecord = recordAsOf(array, startCutoff)
      const endRecord = recordAsOf(array, endCutoff)
      const latest = array[array.length - 1] || {}
      const start = startRecord ? Number(startRecord.amount) || 0 : 0
      const end = endRecord ? Number(endRecord.amount) || 0 : 0
      return {
        type: latest.type,
        alias: latest.alias || latest.type,
        start,
        end,
        change: end - start,
        changePercent: percentChange(start, end),
      }
    })
    .filter((item) => Math.abs(item.change) > 0.005)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit)
}

/**
 * Build a full structured wealth report for the given period.
 *
 * @param convertedRecords Records whose `amount` is already in the target currency.
 * @param periodType `month` for a monthly report, `year` for an annual report.
 * @param ref Any date within the target period (defaults to today).
 */
export const buildWealthReport = (
  convertedRecords: any[],
  periodType: PeriodType,
  ref = dayjs(),
): WealthReport => {
  const anchors = getPeriodAnchors(periodType, ref)
  const grouped = groupArrayByType(convertedRecords).map(({ type, array }) => ({
    type,
    array: sortAscending(array as any[]),
  }))

  const netWorth: NetWorthChange = {
    start: netWorthAsOf(grouped, anchors.prevEnd),
    end: netWorthAsOf(grouped, anchors.currentEnd),
    change: 0,
    changePercent: null,
  }
  netWorth.change = netWorth.end - netWorth.start
  netWorth.changePercent = percentChange(netWorth.start, netWorth.end)

  const prevStartCutoff = dayjs(anchors.prevStart).subtract(1, 'day').format('YYYY-MM-DD')
  const prevNetWorth: NetWorthChange = {
    start: netWorthAsOf(grouped, prevStartCutoff),
    end: netWorthAsOf(grouped, anchors.prevEnd),
    change: 0,
    changePercent: null,
  }
  prevNetWorth.change = prevNetWorth.end - prevNetWorth.start
  prevNetWorth.changePercent = percentChange(prevNetWorth.start, prevNetWorth.end)

  const topMovers = buildTopMovers(grouped, anchors.prevEnd, anchors.currentEnd)
  const riskDrift = buildDrift(grouped, anchors.prevEnd, anchors.currentEnd, 'risk', RISK_ORDER)
  const liquidityDrift = buildDrift(
    grouped,
    anchors.prevEnd,
    anchors.currentEnd,
    'liquidity',
    LIQUIDITY_ORDER,
  )

  const hasData = grouped.length > 0 && (netWorth.start !== 0 || netWorth.end !== 0)

  return { anchors, netWorth, prevNetWorth, topMovers, riskDrift, liquidityDrift, hasData }
}
