<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { CardPlaceholder } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import TreemapChart from '../components/ChartWidget/TreemapChart.svelte'
  import { getAssets } from '../helper/apis'
  import { updatePageMetaInfo, fetchExchangeRates, convertCurrency } from '../helper/utils'
  import { exchangeRates, targetCurrencyCode } from '../stores'
  import type { AssetsItem } from '../typings'

  let rawAssetsArr: AssetsItem[] = []
  let convertedAssetsArr: AssetsItem[] = []
  let isLoading = true

  // More controlled reactive update to prevent unnecessary recalculations
  $: if (rawAssetsArr.length > 0 && $targetCurrencyCode) {
    convertedAssetsArr = rawAssetsArr.map((item) => ({
      ...item,
      amount: convertCurrency(item.amount, item.currency, $targetCurrencyCode, $exchangeRates),
    }))
  }

  onMount(async () => {
    updatePageMetaInfo({
      title: $_('assetStatus'),
    })

    fetchExchangeRates()
    fetchDatabase()
  })

  const fetchDatabase = async () => {
    try {
      isLoading = true
      rawAssetsArr = ((await getAssets()) as AssetsItem[]) || []
    } catch (error) {
      console.error('Error Fetching Assets:', error)
      rawAssetsArr = []
    } finally {
      isLoading = false
    }
  }
</script>

<Header />

<div class="flex w-full flex-col items-center justify-center">
  {#if isLoading}
    <CardPlaceholder size="2xl" class="w-full max-w-full" />
  {:else}
    <TreemapChart sources={convertedAssetsArr}></TreemapChart>
  {/if}
</div>

<Footer />
