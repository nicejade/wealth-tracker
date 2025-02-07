<script lang="ts">
  import { Card, Chart } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SmallPanel from './../SmallPanel.svelte'
  import Caption from './../Caption.svelte'
  import { genDonutOptions } from '../../helper/chart'
  import type { ApexOptions } from 'apexcharts'

  interface PercentageItem {
    name?: string
    value?: number
  }

  export let sources

  const options: ApexOptions | any = genDonutOptions()
  let percentages: PercentageItem[] = []

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
</script>

<Card size="xl" class="h-fit shadow-none md:p-4">
  <Caption title={$_('assetAllocation')} subtitle={$_('currentAssetStatus')}></Caption>
  <Chart {options}></Chart>
  <div class="my-6 flex flex-wrap items-center justify-start pt-4 sm:pt-6 lg:justify-evenly">
    {#each percentages as item}
      <SmallPanel title={item.name} subtitle={`${item.value}%`} />
    {/each}
  </div>
</Card>
