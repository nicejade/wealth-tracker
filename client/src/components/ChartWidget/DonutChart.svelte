<script lang="ts">
  import { Card, Chart } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SmallPanel from './../SmallPanel.svelte'
  import Caption from './../Caption.svelte'
  import { RISK_TYPES, LIQUIDITY_TYPES } from './../../helper/constant'
  import { genDonutOptions } from '../../helper/chart'
  import type { ApexOptions } from 'apexcharts'

  interface PercentageItem {
    name?: string
    value?: number
  }

  interface RiskLiquidityItem {
    name: string
    value: number
    color: string
  }

  export let sources

  const options: ApexOptions | any = genDonutOptions()
  let percentages: PercentageItem[] = []
  let riskDistribution: RiskLiquidityItem[] = []
  let liquidityDistribution: RiskLiquidityItem[] = []

  $: {
    options.series = []
    const totalSumNum = sources.reduce((sum, item) => sum + item.amount, 0)
    let labels = []
    let series = []
    sources.forEach((item) => {
      labels.push(item.alias || item.type)
      series.push((item.amount / totalSumNum) * 100)
    })
    options.labels = labels
    options.series = series
    regenWealthPercentages(options)
    calculateRiskLiquidityDistribution(sources, totalSumNum)
  }

  const regenWealthPercentages = (sources) => {
    percentages = []
    sources.labels.map((item, index) => {
      percentages.push({
        name: item,
        value: options.series[index].toFixed(2),
      })
    })
    percentages = percentages.sort((a, b) => b.value - a.value)
  }

  const calculateRiskLiquidityDistribution = (sources, totalSum) => {
    // 计算风险分布
    const riskGroups = {}
    sources.forEach((item) => {
      const risk = item.risk || RISK_TYPES[0]
      if (!riskGroups[risk]) {
        riskGroups[risk] = 0
      }
      riskGroups[risk] += item.amount
    })

    riskDistribution = RISK_TYPES.map((risk) => {
      const amount = riskGroups[risk] || 0
      const percent = totalSum > 0 ? Number((amount / totalSum) * 100) : 0
      return {
        name: $_(risk.toLowerCase()),
        value: percent,
        color: getRiskColor(risk),
      }
    })

    // 计算流动性分布
    const liquidityGroups = {}
    sources.forEach((item) => {
      const liquidity = item.liquidity || LIQUIDITY_TYPES[0]
      if (!liquidityGroups[liquidity]) {
        liquidityGroups[liquidity] = 0
      }
      liquidityGroups[liquidity] += item.amount
    })

    liquidityDistribution = LIQUIDITY_TYPES.map((liquidity) => {
      const amount = liquidityGroups[liquidity] || 0
      const percent = totalSum > 0 ? Number((amount / totalSum) * 100) : 0
      return {
        name: $_(liquidity.toLowerCase()),
        value: percent,
        color: getLiquidityColor(liquidity),
      }
    })
  }

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'LOW':
        return '#2edfa3' // success color
      case 'MIDDLE':
        return '#f8d826' // link color
      case 'HIGH':
        return '#ff4582' // mark color
      default:
        return '#B7B8B9' // grey color
    }
  }

  const getLiquidityColor = (liquidity: string): string => {
    switch (liquidity) {
      case 'GOOD':
        return '#2edfa3' // success color
      case 'MIDDLE':
        return '#f8d826' // link color
      case 'POOR':
        return '#ff4582' // mark color
      default:
        return '#B7B8B9' // grey color
    }
  }
</script>

<Card size="xl" class="h-fit shadow-none md:p-4">
  <div class="mb-4 flex flex-row gap-3 sm:flex-row sm:items-start sm:justify-between">
    <Caption title={$_('assetAllocation')} subtitle={$_('currentAssetStatus')}></Caption>
    <a href="/status" class="regular-btn focus-visible-ring flex max-h-10 !min-w-fit items-center">
      {$_('assetStatus')}
    </a>
  </div>

  <!-- 风险与流动性分布概览 -->
  <div class="my-4 grid grid-cols-2 gap-4 md:grid-cols-1">
    <!-- 风险分布 -->
    <div class="rounded-lg border border-gray-200 p-4">
      <h3 class="mb-3 text-lg font-semibold text-gray-800">{$_('risk')} {$_('distribution')}</h3>
      <div class="space-y-3">
        {#each riskDistribution as item}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-3 w-3 rounded-full" style="background-color: {item.color}"></div>
              <span class="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <span class="text-blue text-sm font-bold">{item.value.toFixed(2)}%</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- 流动性分布 -->
    <div class="rounded-lg border border-gray-200 p-4">
      <h3 class="mb-3 text-lg font-semibold text-gray-800">
        {$_('liquidity')}
        {$_('distribution')}
      </h3>
      <div class="space-y-3">
        {#each liquidityDistribution as item}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-3 w-3 rounded-full" style="background-color: {item.color}"></div>
              <span class="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <span class="text-blue text-sm font-bold">{item.value.toFixed(2)}%</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <Chart {options}></Chart>

  <div class="my-6 flex flex-wrap items-center justify-start pt-4 sm:pt-6 md:justify-evenly">
    {#each percentages as item}
      <SmallPanel title={item.name} subtitle={`${item.value}%`} />
    {/each}
  </div>
</Card>
