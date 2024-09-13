<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { Card, Chart } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import Caption from './../Caption.svelte'
  import Change from './../Change.svelte'
  import CustomSelect from './../Select.svelte'
  import {
    deepClone,
    fillMissingWealthArr,
    groupArrayByType,
    sortByDatetime,
  } from './../../helper/utils'
  import { genBindingOptions } from './../../helper/chart'
  import { DATE_EXTENT_ARR } from './../../helper/constant'
  import { period, language, theme } from './../../stores'
  import type { ApexOptions } from 'apexcharts'

  export let sources = []

  let DATE_ACTIVE: number = 0
  let options: ApexOptions | any = genBindingOptions($theme)
  let stageChangePercent: number = 0

  $: if ($theme) {
    options = genBindingOptions($theme)
  }

  $: if (sources || $period) {
    regenAreaOptions(sources)
    computeChangePercent(options.series)
  }

  $: dateExtentArr = DATE_EXTENT_ARR.map((item) => ({
    lang: $language,
    name: $_(item.key, { values: { count: item.days } }),
    value: item.value,
  }))

  onMount(() => {
    period.set(DATE_EXTENT_ARR[DATE_ACTIVE])
  })

  const fineTuningArrayLen = (sources) => {
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

  const genChartSeries = (params) => {
    const series = []
    params.forEach((items) => {
      const completeWealthArr = fillMissingWealthArr(items.array, $period.value)
      const targetExtentArr = completeWealthArr.filter((item) => {
        if (dayjs(item.datetime) >= dayjs($period.value)) {
          return item
        }
      })
      const fineTunedArr = fineTuningArrayLen(targetExtentArr)

      series.push({
        name: items.type,
        data: fineTunedArr.map((item) => item.amount || 0),
      })
    })
    return series
  }

  const calculateColumnSums = (series) => {
    if (series.length === 0) return []

    return series[0].data.map((_, column) =>
      series.reduce((sum, row) => sum + (row.data[column] || 0), 0),
    )
  }

  const computeChangePercent = (series) => {
    const lastSeries = series.map((item) => item.data).map((item) => item[item.length - 1])
    const firstSeries = series.map((item) => item.data).map((item) => item[0])
    const lastSeriesSum = lastSeries.reduce((acc, cur) => acc + cur, 0)
    const firstSeriesSum = firstSeries.reduce((acc, cur) => acc + cur, 0)
    stageChangePercent = ((lastSeriesSum - firstSeriesSum) / firstSeriesSum) * 100
  }

  const regenAreaOptions = (wealthArr) => {
    const sortedWealthArr = sortByDatetime(wealthArr)
    const splitWealthArr = groupArrayByType(sortedWealthArr)
    const seriesDataArr = genChartSeries(splitWealthArr)
    const series = deepClone(options.series)
    series[0].data = calculateColumnSums(seriesDataArr)
    options.series = series
  }

  const onHandleSelect = (event: CustomEvent) => {
    period.set(event.detail)
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none 2xl:col-span-2">
  <Caption title={$_('assetTrends')} subtitle={$_('assetTrendInsights')}>
    <div class="inline-flex items-center space-x-4 md:flex">
      <CustomSelect
        options={dateExtentArr}
        active={DATE_ACTIVE}
        listboxClass="w-40"
        on:selected={onHandleSelect} />
      <Change value={stageChangePercent} since="" class="justify-end font-medium" />
    </div>
  </Caption>
  <Chart {options}></Chart>
</Card>
