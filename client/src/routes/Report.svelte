<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { _ } from 'svelte-i18n'
  import { Button, Spinner, Card } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import Caption from '../components/Caption.svelte'
  import Skeleton from '../components/Skeleton.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'
  import CustomSelect from '../components/Select.svelte'
  import { getAssets, getRecords } from '../helper/apis'
  import {
    isNeedScroll,
    genAdviceWithStream,
    parse,
    sleep,
    updatePageMetaInfo,
    getCurrencySymbol,
    convertCurrency,
    fetchExchangeRates,
  } from '../helper/utils'
  import { buildWealthReport, getAvailablePeriods } from '../helper/report'
  import type { PeriodType, WealthReport } from '../helper/report'
  import { trackEvent } from '../helper/analytics'
  import { REPORT_PROMPT_TEMPLATE, LANG_ARR } from '../helper/constant'
  import { notice, alert, language } from '../stores'
  import { exchangeRates, targetCurrencyCode, customCurrencies } from '../stores'
  import { loadUserSettings } from '../helper/settings'
  import type { RecordsItem, Settings } from '../typings'

  let loading: boolean = false
  let isReady: boolean = false
  let rawAssetsArr: Array<any> = []
  let rawRecordsArr: Array<any> = []
  let periodType: PeriodType = 'month'
  let selectedMonth: string = dayjs().format('YYYY-MM')
  let selectedYear: string = dayjs().format('YYYY')
  let report: WealthReport | null = null
  let reportText: string = ''
  let prompt: string = ''
  let htmlBodyNode: HTMLBodyElement = null
  let settings: Settings = {
    apiKey: '',
    baseURL: 'https://api.x.ai/v1/',
    model: 'grok-beta',
    temperature: 0.7,
  }

  $: symbol = getCurrencySymbol($targetCurrencyCode, $customCurrencies)

  // Selectable months / years derived from the recorded data range.
  $: monthOptions = getAvailablePeriods(rawRecordsArr, 'month').map((value) => ({
    name: value,
    value,
  }))
  $: yearOptions = getAvailablePeriods(rawRecordsArr, 'year').map((value) => ({
    name: value,
    value,
  }))
  $: monthActive = Math.max(
    0,
    monthOptions.findIndex((option) => option.value === selectedMonth),
  )
  $: yearActive = Math.max(
    0,
    yearOptions.findIndex((option) => option.value === selectedYear),
  )

  // The reference date that anchors the selected reporting period.
  $: periodRef =
    periodType === 'month' ? dayjs(`${selectedMonth}-01`) : dayjs(`${selectedYear}-01-01`)

  // Recompute the structured report whenever the source data, currency or period changes.
  $: if (
    isReady &&
    rawRecordsArr &&
    rawAssetsArr &&
    $targetCurrencyCode &&
    $exchangeRates &&
    periodRef
  ) {
    report = buildWealthReport(buildConvertedRecords(), periodType, periodRef)
  }

  // Keep the AI prompt in sync with the latest structured report and language.
  $: if (report && $language) {
    prompt = buildPrompt(report)
  }

  onMount(async () => {
    updatePageMetaInfo({
      title: $_('report.title'),
      description: $_('report.subtitle'),
    })
    htmlBodyNode = document.getElementsByTagName('body')[0]

    fetchExchangeRates()

    try {
      const userSettings = await loadUserSettings()
      settings = {
        apiKey: userSettings.apiKey || '',
        baseURL: userSettings.baseURL || 'https://api.x.ai/v1/',
        model: userSettings.model || 'grok-beta',
        temperature: userSettings.temperature || 0.7,
      }
    } catch (error) {
      settings = {
        apiKey: localStorage.getItem('apiKey') || '',
        baseURL: localStorage.getItem('baseURL') || 'https://api.x.ai/v1/',
        model: localStorage.getItem('model') || 'grok-beta',
        temperature: parseFloat(localStorage.getItem('temperature') || '0.7'),
      }
    }

    try {
      const results: Array<any> = await Promise.all([getAssets(), getRecords()])
      rawAssetsArr = results[0] as any[]
      const records: RecordsItem = results[1]
      rawRecordsArr = records.data || []
      isReady = true
    } catch (error) {
      alert.set(error.message)
    }
  })

  // Merge historical records with the current assets snapshot (as today) and convert
  // every amount into the active target currency, matching the homepage chart pipeline.
  const buildConvertedRecords = () => {
    const today = dayjs().format('YYYY-MM-DD')
    const currentSnapshots = rawAssetsArr.map((item) => ({ ...item, datetime: today }))
    const combined = [...rawRecordsArr, ...currentSnapshots]
    return combined.map((item) => ({
      ...item,
      amount: convertCurrency(item.amount, item.currency, $targetCurrencyCode, $exchangeRates),
    }))
  }

  const money = (value: number): string => {
    return `${symbol}${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const signedMoney = (value: number): string => {
    const sign = value >= 0 ? '+' : '-'
    const abs = Math.abs(Number(value)).toLocaleString('en-US', { maximumFractionDigits: 0 })
    return `${sign}${symbol}${abs}`
  }

  const percent = (value: number | null): string => {
    if (value === null || !Number.isFinite(value)) return '—'
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const driftText = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}pp`
  }

  const changeClass = (value: number): string => {
    if (value > 0) return 'text-success'
    if (value < 0) return 'text-mark'
    return 'text-gray-400'
  }

  const changeWeightClass = (value: number, strong = false): string => {
    if (value === 0) return 'font-normal'
    return strong ? 'font-extrabold' : 'font-semibold'
  }

  const mutedClass = 'font-light text-gray-400'

  const riskLabel = (key: string): string => $_(key.toLowerCase())
  const liquidityLabel = (key: string): string => $_(key.toLowerCase())

  const findNameByValue = (sourceArr, value) => {
    const target = sourceArr.find((item) => item.value === value)
    return target ? target.name : ''
  }

  const formatTemplate = (template: string, data: Record<string, any>) => {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const trimmedKey = key.trim()
      return data[trimmedKey] ?? match
    })
  }

  const buildPrompt = (source: WealthReport): string => {
    const periodName = periodType === 'month' ? $_('report.monthly') : $_('report.annual')

    const topMovers = source.topMovers.length
      ? source.topMovers
          .map(
            (item) =>
              `- ${item.alias}: ${money(item.start)} -> ${money(item.end)} (${signedMoney(
                item.change,
              )}, ${percent(item.changePercent)})`,
          )
          .join('\n')
      : '- (no account changes this period)'

    const riskDrift = source.riskDrift.length
      ? source.riskDrift
          .map(
            (item) =>
              `- ${riskLabel(item.key)}: ${item.startShare.toFixed(1)}% -> ${item.endShare.toFixed(
                1,
              )}% (${driftText(item.drift)})`,
          )
          .join('\n')
      : '- (no allocation data)'

    const liquidityDrift = source.liquidityDrift.length
      ? source.liquidityDrift
          .map(
            (item) =>
              `- ${liquidityLabel(item.key)}: ${item.startShare.toFixed(
                1,
              )}% -> ${item.endShare.toFixed(1)}% (${driftText(item.drift)})`,
          )
          .join('\n')
      : '- (no allocation data)'

    return formatTemplate(REPORT_PROMPT_TEMPLATE, {
      language: findNameByValue(LANG_ARR, $language),
      periodName,
      period: source.anchors.label,
      startNetWorth: money(source.netWorth.start),
      endNetWorth: money(source.netWorth.end),
      netChange: signedMoney(source.netWorth.change),
      netChangePercent: percent(source.netWorth.changePercent),
      prevChangePercent: percent(source.prevNetWorth.changePercent),
      topMovers,
      riskDrift,
      liquidityDrift,
    })
  }

  const setPeriod = (type: PeriodType) => {
    if (periodType === type) return
    periodType = type
    reportText = ''
    trackEvent('report-period-change', { period: type })
  }

  const onMonthSelect = (event) => {
    if (event.detail?.value === selectedMonth) return
    selectedMonth = event.detail.value
    reportText = ''
  }

  const onYearSelect = (event) => {
    if (event.detail?.value === selectedYear) return
    selectedYear = event.detail.value
    reportText = ''
  }

  const scrollChatToBottom = async () => {
    if (!isNeedScroll()) return
    await sleep(10)
    htmlBodyNode.scrollTo({ top: 2e6, behavior: 'smooth' })
  }

  const handleGptStream = () => {
    const options = {
      onUpdate: (res) => {
        if (loading) loading = false
        if (res.stream) {
          reportText += res.stream
        } else if (res.error) {
          reportText += res.error
          alert.set(res.error)
        }
        scrollChatToBottom()
      },
      onFinish: () => {
        loading = false
        notice.set($_('report.aiReportSuccess'))
      },
      onError: (error) => {
        loading = false
        alert.set(error.message)
      },
    }
    loading = true
    reportText = ''
    genAdviceWithStream({ prompt, settings }, options)
  }

  const onGenerateClick = () => {
    if (!report || !report.hasData) {
      alert.set($_('report.noData'))
      return
    }
    trackEvent('ai-report-request', { model: settings.model, period: periodType })
    handleGptStream()
  }
</script>

<Header />

<div class="flex w-full flex-col items-center justify-center space-y-8">
  <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
    <div class="flex w-full items-center justify-between md:flex-col md:items-start md:space-y-4">
      <Caption title={$_('report.title')} subtitle={$_('report.subtitle')}></Caption>
      <div class="flex items-center space-x-3 md:w-full md:justify-between">
        <div class="inline-flex rounded-full border border-gray-300 p-1">
          <button
            class="min-w-16 rounded-full px-4 py-1.5 text-sm transition-colors {periodType ===
            'month'
              ? 'bg-brand font-semibold text-white'
              : 'font-normal text-gray-500 hover:bg-gray-100'}"
            on:click={() => setPeriod('month')}>
            {$_('report.monthly')}
          </button>
          <button
            class="min-w-16 rounded-full px-4 py-1.5 text-sm transition-colors {periodType ===
            'year'
              ? 'bg-brand font-semibold text-white'
              : 'font-normal text-gray-500 hover:bg-gray-100'}"
            on:click={() => setPeriod('year')}>
            {$_('report.annual')}
          </button>
        </div>
        {#if isReady}
          {#if periodType === 'month'}
            <CustomSelect
              options={monthOptions}
              active={monthActive}
              listboxClass="w-32"
              on:selected={onMonthSelect} />
          {:else}
            <CustomSelect
              options={yearOptions}
              active={yearActive}
              listboxClass="w-28"
              on:selected={onYearSelect} />
          {/if}
        {/if}
      </div>
    </div>
  </Card>

  {#if !isReady}
    <Skeleton type="all" />
  {:else if !report || !report.hasData}
    <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
      <div class="flex w-full items-center justify-center py-12 text-sm {mutedClass}">
        {$_('report.noData')}
      </div>
    </Card>
  {:else}
    <!-- Net worth summary -->
    <div class="grid w-full grid-cols-3 gap-4 md:grid-cols-1 md:gap-2">
      <div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
        <p class="text-sm font-light text-black">{$_('report.netWorth')}</p>
        <strong class="text-brand text-xl font-extrabold md:text-lg">
          {money(report.netWorth.end)}
        </strong>
        <p class="mt-1 text-xs {mutedClass}">
          {$_('report.periodLabel', { values: { period: report.anchors.label } })}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 text-center">
        <p class="text-sm font-light text-black">{$_('report.netWorthChange')}</p>
        <strong
          class="text-xl md:text-lg {changeClass(report.netWorth.change)} {changeWeightClass(
            report.netWorth.change,
            true,
          )}">
          {signedMoney(report.netWorth.change)}
        </strong>
        <p
          class="mt-1 text-xs {changeClass(report.netWorth.changePercent || 0)} {report.netWorth
            .changePercent
            ? 'font-medium'
            : mutedClass}">
          {percent(report.netWorth.changePercent)}
        </p>
      </div>
      <div class="border-brand rounded-lg border bg-yellow-50 p-4 text-center">
        <p class="text-sm font-light text-black">{$_('report.vsLastPeriod')}</p>
        <strong
          class="text-xl md:text-lg {changeClass(report.prevNetWorth.change)} {changeWeightClass(
            report.prevNetWorth.change,
            true,
          )}">
          {percent(report.prevNetWorth.changePercent)}
        </strong>
        <p class="mt-1 text-xs {mutedClass}">{signedMoney(report.prevNetWorth.change)}</p>
      </div>
    </div>

    <!-- Top movers -->
    <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
      <Caption title={$_('report.topMovers')}></Caption>
      <div class="mt-4 flex w-full flex-col divide-y divide-gray-100">
        {#if report.topMovers.length}
          {#each report.topMovers as mover (mover.type)}
            <div class="flex items-center justify-between py-3">
              <div class="flex flex-col">
                <span class="text-base font-medium text-black">{mover.alias}</span>
                <span class="text-xs {mutedClass}">
                  {money(mover.start)} → {money(mover.end)}
                </span>
              </div>
              <div class="flex flex-col items-end">
                <span
                  class="text-base {changeClass(mover.change)} {changeWeightClass(mover.change)}">
                  {signedMoney(mover.change)}
                </span>
                <span
                  class="text-xs {changeClass(mover.change)} {mover.change
                    ? 'font-medium'
                    : 'font-light'}">
                  {percent(mover.changePercent)}
                </span>
              </div>
            </div>
          {/each}
        {:else}
          <div class="py-6 text-center text-sm {mutedClass}">{$_('report.noMovers')}</div>
        {/if}
      </div>
    </Card>

    <!-- Structure drift -->
    <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
      <div class="grid w-full grid-cols-2 gap-8 md:grid-cols-1 md:gap-4">
        <div>
          <Caption title={$_('report.riskDrift')}></Caption>
          <div class="mt-4 flex flex-col space-y-3">
            {#each report.riskDrift as item (item.key)}
              <div class="flex items-center justify-between text-sm">
                <span class="w-16 font-medium text-black">{riskLabel(item.key)}</span>
                <span class="flex-1 px-2 text-right text-xs {mutedClass}">
                  {item.startShare.toFixed(1)}% → {item.endShare.toFixed(1)}%
                </span>
                <span
                  class="w-16 text-right text-sm {changeClass(item.drift)} {changeWeightClass(
                    item.drift,
                  )}">
                  {driftText(item.drift)}
                </span>
              </div>
            {/each}
          </div>
        </div>
        <div>
          <Caption title={$_('report.liquidityDrift')}></Caption>
          <div class="mt-4 flex flex-col space-y-3">
            {#each report.liquidityDrift as item (item.key)}
              <div class="flex items-center justify-between text-sm">
                <span class="w-16 font-medium text-black">{liquidityLabel(item.key)}</span>
                <span class="flex-1 px-2 text-right text-xs {mutedClass}">
                  {item.startShare.toFixed(1)}% → {item.endShare.toFixed(1)}%
                </span>
                <span
                  class="w-16 text-right text-sm {changeClass(item.drift)} {changeWeightClass(
                    item.drift,
                  )}">
                  {driftText(item.drift)}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Card>

    <!-- AI report -->
    <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
      <div class="mb-4 flex w-full items-center justify-between">
        <Caption
          title={periodType === 'month' ? $_('report.generateAI') : $_('report.generateAIAnnual')}
        ></Caption>
        <Button
          class="regular-btn gradient-text hover:border-brand !min-w-fit text-center focus-within:ring-0"
          on:click={onGenerateClick}
          disabled={loading}>
          {#if loading}
            <Spinner color="red" class="mr-2" size="4" />
          {/if}
          <SvgIcon name="edit" width={18} height={18} color="#f59e0b" />
          <span class="ml-2">
            {periodType === 'month' ? $_('report.generateAI') : $_('report.generateAIAnnual')}
          </span>
        </Button>
      </div>
      {#if reportText}
        <div class="text-brand my-2 w-full whitespace-pre-line rounded-lg p-2 shadow">
          <article class="markdown-article prose md:prose-sm md:prose-pre:max-w-md lg:prose-md">
            {@html parse(reportText).replace(/>\s+</g, '><').replace(/\n/g, '').trim()}
          </article>
        </div>
      {:else}
        <div class="my-4 flex w-full items-center justify-center px-2">
          <p class="max-w-2xl text-center text-sm font-light leading-relaxed text-gray-400">
            {$_('report.aiReportTip')}
          </p>
        </div>
      {/if}
    </Card>
  {/if}
</div>

<Footer />
