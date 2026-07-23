import dayjs from 'dayjs'
import { buildWealthReport } from './report'
import type { WealthReport } from './report'
import { convertCurrency, getCurrencySymbol } from './utils'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AssetItem {
  alias: string
  amount: number
  currency: string
  liquidity: string
  risk: string
  tags?: string
}

interface BuildSystemContextOptions {
  assets: AssetItem[]
  records: any[]
  targetCurrency: string
  exchangeRates: Record<string, number>
  customCurrencies?: any[]
  languageName: string
}

const money = (value: number, symbol: string): string => {
  return `${symbol}${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const signedMoney = (value: number, symbol: string): string => {
  const sign = value >= 0 ? '+' : '-'
  const abs = Math.abs(Number(value)).toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `${sign}${symbol}${abs}`
}

const percent = (value: number | null): string => {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const buildConvertedRecords = (
  assets: AssetItem[],
  records: any[],
  targetCurrency: string,
  exchangeRates: Record<string, number>,
) => {
  const today = dayjs().format('YYYY-MM-DD')
  const currentSnapshots = assets.map((item) => ({ ...item, datetime: today }))
  const combined = [...records, ...currentSnapshots]
  return combined.map((item) => ({
    ...item,
    amount: convertCurrency(item.amount, item.currency, targetCurrency, exchangeRates),
  }))
}

const formatReportSummary = (report: WealthReport, label: string, symbol: string): string => {
  if (!report.hasData) return `### ${label}\n- No sufficient data for this period.`

  const movers = report.topMovers.length
    ? report.topMovers
        .map(
          (item) =>
            `  - ${item.alias}: ${money(item.start, symbol)} → ${money(item.end, symbol)} (${signedMoney(item.change, symbol)}, ${percent(item.changePercent)})`,
        )
        .join('\n')
    : '  - (no significant account changes)'

  const riskDrift = report.riskDrift.length
    ? report.riskDrift
        .map(
          (item) =>
            `  - ${item.key}: ${item.startShare.toFixed(1)}% → ${item.endShare.toFixed(1)}% (${item.drift >= 0 ? '+' : ''}${item.drift.toFixed(1)}pp)`,
        )
        .join('\n')
    : '  - (no allocation data)'

  const liquidityDrift = report.liquidityDrift.length
    ? report.liquidityDrift
        .map(
          (item) =>
            `  - ${item.key}: ${item.startShare.toFixed(1)}% → ${item.endShare.toFixed(1)}% (${item.drift >= 0 ? '+' : ''}${item.drift.toFixed(1)}pp)`,
        )
        .join('\n')
    : '  - (no allocation data)'

  return `### ${label} (${report.anchors.label})
- Net worth: ${money(report.netWorth.start, symbol)} → ${money(report.netWorth.end, symbol)} (${signedMoney(report.netWorth.change, symbol)}, ${percent(report.netWorth.changePercent)})
- Previous period change: ${percent(report.prevNetWorth.changePercent)}
- Top movers:
${movers}
- Risk structure drift:
${riskDrift}
- Liquidity structure drift:
${liquidityDrift}`
}

/**
 * Build the system context message that anchors every chat turn with the user's
 * current assets and structured historical summaries (monthly + annual).
 */
export const buildSystemContext = (options: BuildSystemContextOptions): string => {
  const {
    assets,
    records,
    targetCurrency,
    exchangeRates,
    customCurrencies = [],
    languageName,
  } = options

  const symbol = getCurrencySymbol(targetCurrency, customCurrencies)
  const convertedRecords = buildConvertedRecords(assets, records, targetCurrency, exchangeRates)
  const monthlyReport = buildWealthReport(convertedRecords, 'month')
  const annualReport = buildWealthReport(convertedRecords, 'year')

  const totalNetWorth = assets.reduce((sum, item) => {
    const converted =
      exchangeRates && Object.keys(exchangeRates).length > 0
        ? convertCurrency(item.amount, item.currency, targetCurrency, exchangeRates)
        : item.currency === targetCurrency
          ? item.amount
          : 0
    return sum + converted
  }, 0)

  const liquidAssets = assets.reduce((sum, item) => {
    if (item.liquidity?.toUpperCase() !== 'GOOD') return sum
    const converted =
      exchangeRates && Object.keys(exchangeRates).length > 0
        ? convertCurrency(item.amount, item.currency, targetCurrency, exchangeRates)
        : item.currency === targetCurrency
          ? item.amount
          : 0
    return sum + converted
  }, 0)

  const assetsDetail = assets.length
    ? assets
        .map((item) => {
          const itemSymbol = getCurrencySymbol(item.currency || 'CNY', customCurrencies)
          const tagsInfo = item.tags?.trim() ? `, tags: ${item.tags}` : ''
          return `  - ${item.alias}: ${money(item.amount, itemSymbol)} (liquidity: ${item.liquidity?.toLowerCase()}, risk: ${item.risk?.toLowerCase()}${tagsInfo})`
        })
        .join('\n')
    : '  - (no assets recorded)'

  const monthlySummary = formatReportSummary(monthlyReport, 'Monthly Summary', symbol)
  const annualSummary = formatReportSummary(annualReport, 'Annual Summary', symbol)

  return `You are a professional financial advisor embedded in a personal wealth tracking app. Answer the user's questions based ONLY on the data provided below. Be concrete, cite specific figures, and give actionable advice when appropriate.

## Response Rules
- Respond in ${languageName}
- Use markdown for readability
- Reference actual account names and numbers from the data
- If data is insufficient to answer, say so clearly
- Include a brief risk disclaimer when giving investment advice
- Do not invent accounts, amounts, or historical figures not present in the context

## Current Assets (as of ${dayjs().format('YYYY-MM-DD')})
- Total net worth (${targetCurrency}): ${money(totalNetWorth, symbol)}
- High-liquidity assets (${targetCurrency}): ${money(liquidAssets, symbol)}
- Accounts:
${assetsDetail}

## Historical Summaries

${monthlySummary}

${annualSummary}`
}
