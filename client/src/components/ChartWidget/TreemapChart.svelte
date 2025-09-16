<script lang="ts">
  import { Card, Chart } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './../SvgIcon.svelte'
  import Caption from './../Caption.svelte'
  import SmallPanel from './../SmallPanel.svelte'
  import { genTreemapOptions } from '../../helper/chart'
  import type { ApexOptions } from 'apexcharts'

  interface TagDataItem {
    name: string
    amount: number
    percentage: number
  }

  export let sources

  const options: ApexOptions | any = genTreemapOptions()
  let assetsTagsArr: TagDataItem[] = []

  // Reactive statement to process data whenever sources change
  $: if (sources && sources.length) {
    processAssetsTags(sources)
  }

  const processAssetsTags = (assets) => {
    const tagGroups = new Map<string, number>()
    let totalOriginalAmount = 0

    // 处理每个资产，计算标签分配
    assets.forEach((asset) => {
      const assetAmount =
        typeof asset.amount === 'number' ? asset.amount : parseFloat(asset.amount) || 0
      totalOriginalAmount += assetAmount

      if (asset.tags && asset.tags.trim()) {
        const tags = asset.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)

        if (tags.length > 0) {
          tags.forEach((tag) => {
            const currentAmount = tagGroups.get(tag) || 0
            tagGroups.set(tag, currentAmount + assetAmount)
          })
        } else {
          // 处理空标签的情况
          const currentAmount = tagGroups.get($_('untaggedAssets')) || 0
          tagGroups.set($_('untaggedAssets'), currentAmount + assetAmount)
        }
      } else {
        // 处理无标签资产
        const currentAmount = tagGroups.get($_('untaggedAssets')) || 0
        tagGroups.set($_('untaggedAssets'), currentAmount + assetAmount)
      }
    })

    // 转换为数组并计算百分比
    assetsTagsArr = Array.from(tagGroups.entries())
      .map(([name, amount]) => ({
        name,
        amount: Number(amount.toFixed(2)),
        percentage:
          totalOriginalAmount > 0 ? Number(((amount / totalOriginalAmount) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // 准备树状图数据
    const treemapData = assetsTagsArr.map((item) => ({
      x: item.name,
      y: item.amount,
    }))

    // 更新图表选项
    const newOptions = { ...genTreemapOptions() }
    newOptions.series = [{ data: treemapData }]
    Object.assign(options, newOptions)
  }
</script>

<Card size="xl" class="h-fit shadow-none md:p-4">
  <div class="mb-4 flex flex-row gap-3 sm:flex-row sm:items-start sm:justify-between">
    <Caption title={$_('assetStatus')} subtitle={$_('assetStatusInsights')}></Caption>
    <a
      href="/"
      class="regular-btn focus-visible-ring !min-w-fit self-start sm:shrink-0 sm:self-auto">
      {$_('backToHomepage')}
    </a>
  </div>

  {#if assetsTagsArr.length === 0}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="my-4 flex w-full items-center justify-center">
        <SvgIcon name="empty" width={186} height={154} />
      </div>
      <p class="text-base text-gray-500">{$_('noTagsData')}</p>
    </div>
  {:else}
    <Chart {options}></Chart>

    <!-- Small panels for top tags -->
    <div class="flex flex-wrap items-center justify-start md:justify-evenly">
      {#each assetsTagsArr.slice(0, 10) as item}
        <SmallPanel title={item.name} subtitle={`${item.percentage}%`} />
      {/each}
    </div>
  {/if}
</Card>
