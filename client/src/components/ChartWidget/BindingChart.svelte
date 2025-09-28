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
  import {
    RISK_TYPES,
    LIQUIDITY_TYPES,
    DATE_PERIOD_ARR,
    STORAGE_RISK_FILTER,
    STORAGE_LIQUIDITY_FILTER,
    STORAGE_ACCOUNT_FILTER,
  } from './../../helper/constant'
  import { period, language } from './../../stores'
  import type { ApexOptions } from 'apexcharts'

  export let sources = []

  let DATE_ACTIVE: number = 0
  let options: ApexOptions | any = genBindingOptions($period.days)
  let stageChangePercent: number = 0
  let selectedRisk: string = localStorage.getItem(STORAGE_RISK_FILTER) || 'ALL'
  let selectedLiquidity: string = localStorage.getItem(STORAGE_LIQUIDITY_FILTER) || 'ALL'
  let selectedAccount: string = localStorage.getItem(STORAGE_ACCOUNT_FILTER) || 'ALL'

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

  $: riskOptions = [
    { name: $_('all'), value: 'ALL' },
    ...RISK_TYPES.map((type) => ({ name: $_(type.toLowerCase()), value: type })),
  ]

  $: liquidityOptions = [
    { name: $_('all'), value: 'ALL' },
    ...LIQUIDITY_TYPES.map((type) => ({ name: $_(type.toLowerCase()), value: type })),
  ]

  $: accountOptions = [
    { name: $_('all'), value: 'ALL' },
    ...sources.reduce((acc, asset) => {
      if (!acc.find((item) => item.value === asset.type)) {
        acc.push({ name: asset.alias || asset.type, value: asset.type })
      }
      return acc
    }, []),
  ]

  $: riskActiveIndex = riskOptions.findIndex((option) => option.value === selectedRisk)
  $: liquidityActiveIndex = liquidityOptions.findIndex(
    (option) => option.value === selectedLiquidity,
  )
  $: accountActiveIndex = accountOptions.findIndex((option) => option.value === selectedAccount)

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
    let filteredAssetsArr = assetsArr

    // 根据风险筛选
    if (selectedRisk !== 'ALL') {
      filteredAssetsArr = filteredAssetsArr.filter((asset) => asset.risk === selectedRisk)
    }

    // 根据流动性筛选
    if (selectedLiquidity !== 'ALL') {
      filteredAssetsArr = filteredAssetsArr.filter((asset) => asset.liquidity === selectedLiquidity)
    }

    // 根据账户筛选
    if (selectedAccount !== 'ALL') {
      filteredAssetsArr = filteredAssetsArr.filter((asset) => asset.type === selectedAccount)
    }

    const sortedAssetsArr = sortByDatetime(filteredAssetsArr)
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

  const onRiskSelect = (event: CustomEvent) => {
    selectedRisk = event.detail.value
    localStorage.setItem(STORAGE_RISK_FILTER, selectedRisk)
    regenAreaOptions(sources)
  }

  const onLiquiditySelect = (event: CustomEvent) => {
    selectedLiquidity = event.detail.value
    localStorage.setItem(STORAGE_LIQUIDITY_FILTER, selectedLiquidity)
    regenAreaOptions(sources)
  }

  const onAccountSelect = (event: CustomEvent) => {
    selectedAccount = event.detail.value
    localStorage.setItem(STORAGE_ACCOUNT_FILTER, selectedAccount)
    regenAreaOptions(sources)
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

  <!-- 筛选选项 -->
  <div class="mt-4 flex flex-wrap items-center gap-4">
    <CustomSelect
      label={$_('account')}
      options={accountOptions}
      active={accountActiveIndex >= 0 ? accountActiveIndex : 0}
      listboxClass="w-32"
      on:selected={onAccountSelect} />
    <CustomSelect
      label={$_('risk')}
      options={riskOptions}
      active={riskActiveIndex >= 0 ? riskActiveIndex : 0}
      listboxClass="w-32"
      on:selected={onRiskSelect} />
    <CustomSelect
      label={$_('liquidity')}
      options={liquidityOptions}
      active={liquidityActiveIndex >= 0 ? liquidityActiveIndex : 0}
      listboxClass="w-32"
      on:selected={onLiquiditySelect} />
  </div>
</Card>
