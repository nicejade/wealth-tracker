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
    fillMissingAssetsArr,
    groupArrayByType,
    sortByDatetime,
    fineTuningArrayLen,
    computeChangePercent,
  } from './../../helper/utils'
  import { genBindingOptions } from './../../helper/chart'
  import { DATE_PERIOD_ARR } from './../../helper/constant'
  import { period, language } from './../../stores'
  import type { ApexOptions } from 'apexcharts'

  export let sources = []

  let DATE_ACTIVE: number = 0
  let options: ApexOptions | any = genBindingOptions($period.days)
  let stageChangePercent: number = 0

  $: if (sources || $period) {
    regenAreaOptions(sources)
    stageChangePercent = computeChangePercent(options.series)
  }

  $: dateExtentArr = DATE_PERIOD_ARR.map((item) => ({
    days: item.days,
    lang: $language,
    name: $_(item.key, { values: { count: item.days } }),
    value: item.value,
  }))

  onMount(() => {
    period.set(DATE_PERIOD_ARR[DATE_ACTIVE])
  })

  const genChartSeries = (params) => {
    const series = []
    params.forEach((items) => {
      const completeAssetsArr = fillMissingAssetsArr(items.array, $period.value)
      const targetExtentArr = completeAssetsArr.filter((item) => {
        if (dayjs(item.datetime) >= dayjs($period.value)) {
          return item
        }
      })
      const fineTunedArr = fineTuningArrayLen(targetExtentArr)

      series.push({
        name: items.type,
        data: fineTunedArr.map((item) => item?.amount || 0),
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

  const regenAreaOptions = (assetsArr) => {
    const sortedAssetsArr = sortByDatetime(assetsArr)
    const splitAssetsArr = groupArrayByType(sortedAssetsArr)
    const seriesDataArr = genChartSeries(splitAssetsArr)
    const series = deepClone(options.series)
    series[0].data = calculateColumnSums(seriesDataArr)
    options.series = series
  }

  const onHandleSelect = (event: CustomEvent) => {
    period.set(event.detail)
    options = genBindingOptions($period.days)
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none md:p-4 2xl:col-span-2">
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
