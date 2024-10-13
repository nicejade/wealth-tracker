<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { Card, Chart } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import Caption from './../Caption.svelte'
  import Change from './../Change.svelte'
  import CustomSelect from './../Select.svelte'
  import {
    fillMissingWealthArr,
    generateDatesArray,
    groupArrayByType,
    sortByDatetime,
    fineTuningArrayLen,
  } from './../../helper/utils'
  import { genAreaOptions } from './../../helper/chart'
  import { DATE_EXTENT_ARR } from './../../helper/constant'
  import { extent, language } from './../../stores'
  import type { ApexOptions } from 'apexcharts'

  export let sources = []

  let DATE_ACTIVE: number = 0
  const options: ApexOptions | any = genAreaOptions()
  let stageChangePercent: number = 0

  $: if (sources || $extent) {
    regenAreaOptions(sources)
    computeChangePercent(options.series)
  }

  $: dateExtentArr = DATE_EXTENT_ARR.map((item) => ({
    lang: $language,
    name: $_(item.key, { values: { count: item.days } }),
    value: item.value,
  }))

  onMount(() => {
    extent.set(DATE_EXTENT_ARR[DATE_ACTIVE])
  })

  const genChartSeries = (params) => {
    const series = []
    params.forEach((items) => {
      const completeWealthArr = fillMissingWealthArr(items.array, $extent.value)
      const targetExtentArr = completeWealthArr.filter((item) => {
        if (dayjs(item.datetime) >= dayjs($extent.value)) {
          return item
        }
      })
      const fineTunedArr = fineTuningArrayLen(targetExtentArr)
      const { alias } = items.array.at(-1)
      series.push({
        name: alias,
        data: fineTunedArr.map((item) => item.amount || 0),
      })
    })
    return series
  }

  const computeChangePercent = (series) => {
    const lastSeries = series.map((item) => item.data).map((item) => item[item.length - 1])
    const firstSeries = series.map((item) => item.data).map((item) => item[0])
    const lastSeriesSum = lastSeries.reduce((acc, cur) => acc + cur, 0)
    const firstSeriesSum = firstSeries.reduce((acc, cur) => acc + cur, 0)
    stageChangePercent = ((lastSeriesSum - firstSeriesSum) / firstSeriesSum) * 100
  }

  const regenAreaOptions = (assetsArr) => {
    const sortedAssetsArr = sortByDatetime(assetsArr)
    const splitAssetsArr = groupArrayByType(sortedAssetsArr)
    const series = genChartSeries(splitAssetsArr)
    options.series = series
    const categories = generateDatesArray($extent.value)
    options.xaxis.categories = fineTuningArrayLen(categories)
  }

  const onHandleSelect = (event: CustomEvent) => {
    extent.set(event.detail)
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none 2xl:col-span-2">
  <Caption title={$_('assetChanges')} subtitle={$_('assetChangeInsights')}>
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
