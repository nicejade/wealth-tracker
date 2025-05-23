<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { _ } from 'svelte-i18n'
  import { CardPlaceholder } from 'flowbite-svelte'
  import { Button, Modal } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import OperatingArea from '../components/OperatingArea.svelte'
  import TableWidget from '../components/ChartWidget/TableWidget.svelte'
  import AreaChart from '../components/ChartWidget/AreaChart.svelte'
  import DonutChart from '../components/ChartWidget/DonutChart.svelte'
  import BindingChart from '../components/ChartWidget/BindingChart.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'
  import { getAssets, destroyAssets, getRecords, resetDatabase } from '../helper/apis'
  import { ACTION_TYPES, DEFAULT_ACCOUNT_ITEM } from './../helper/constant'
  import type { AssetsItem, RecordsItem } from '../typings'
  import { convertCurrency, deepClone } from '../helper/utils'
  import { exchangeRates, targetCurrencyCode } from '../stores'

  let rawAssetsArr = []
  let rawRecordsArr = []
  let convertedAssetsArr = []
  let convertedRecordsArr = []
  let currentAssetItem: AssetsItem
  let updateActionType: string = ''
  let isShowUpdateModal: boolean = false
  let isShowComfirmModal: boolean = false
  let isShowResetModal: boolean = false
  let isShowChart: boolean = false
  let typeToBeDestroyed: string = ''

  // 添加响应式声明，当原始数据或货币相关 store 变化时更新转换后的数组
  $: if (rawRecordsArr.length > 0 && $targetCurrencyCode) {
    convertedAssetsArr = rawAssetsArr.map((item) => ({
      ...item,
      amount: convertCurrency(item.amount, item.currency, $targetCurrencyCode, $exchangeRates),
    }))
    convertedRecordsArr = rawRecordsArr.map((item) => ({
      ...item,
      amount: convertCurrency(item.amount, item.currency, $targetCurrencyCode, $exchangeRates),
    }))
  }

  onMount(() => {
    fetchDatabase()
  })

  const fetchDatabase = async () => {
    try {
      const results: Array<any> = await Promise.all([getAssets(), getRecords()])
      rawAssetsArr = results[0] as any[]
      const records: RecordsItem = results[1]
      rawRecordsArr = records.data
      updateRawRecords()
    } catch (error) {
      console.error('Error Fetching Data:', error)
    }
  }

  const updateRawRecords = async () => {
    const currentAssetsArr = rawAssetsArr.map((item) => {
      item.rawDatetime = item.datetime
      item.datetime = dayjs().format('YYYY-MM-DD')
      return item
    })
    rawRecordsArr = rawRecordsArr.concat(currentAssetsArr)
    isShowChart = true
  }

  const handleAdd = () => {
    currentAssetItem = deepClone(DEFAULT_ACCOUNT_ITEM)
    currentAssetItem.type = Date.now().toString()
    updateActionType = ACTION_TYPES.create
    isShowUpdateModal = true
  }

  const handleUpate = (event) => {
    currentAssetItem = event.detail
    updateActionType = ACTION_TYPES.update
    isShowUpdateModal = true
  }

  const handleDestroy = (event) => {
    const { type } = event.detail
    typeToBeDestroyed = type
    isShowComfirmModal = true
  }

  const handleReset = () => {
    isShowResetModal = true
  }

  const handleUpdateConfirm = () => {
    fetchDatabase()
  }

  const handleUpdateClose = () => {
    isShowUpdateModal = false
  }

  const handleComfirm = async () => {
    try {
      await destroyAssets({ type: typeToBeDestroyed })
      fetchDatabase()
      isShowComfirmModal = false
    } catch (error) {
      console.error('Error destroy assets:', error)
    }
  }

  const handleCancel = () => {
    isShowComfirmModal = false
  }

  const handleResetComfirm = async () => {
    try {
      await resetDatabase()
      fetchDatabase()
      isShowResetModal = false
    } catch (error) {
      console.error('Error destroy assets:', error)
    }
  }

  const handleResetCancel = () => {
    isShowResetModal = false
  }
</script>

<Header />

<div class="flex w-full flex-col items-center justify-center space-y-8">
  <OperatingArea on:add={handleAdd} />
  <TableWidget
    options={rawAssetsArr}
    on:update={handleUpate}
    on:destroy={handleDestroy}
    on:reset={handleReset} />
  {#if !isShowChart}
    <CardPlaceholder size="lg" class="w-full max-w-full" />
  {/if}

  {#if isShowChart && convertedAssetsArr.length}
    <DonutChart sources={convertedAssetsArr}></DonutChart>
    <AreaChart sources={convertedRecordsArr}></AreaChart>
    <BindingChart sources={convertedRecordsArr}></BindingChart>
  {/if}
</div>

{#if isShowUpdateModal}
  <UpdateModal
    action={updateActionType}
    items={currentAssetItem}
    on:confirm={handleUpdateConfirm}
    on:close={handleUpdateClose} />
{/if}

<Modal bind:open={isShowComfirmModal} size="sm" outsideclose>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('destroyAccountConfirmation')}
    </h3>
    <Button
      type="button"
      outline
      class="regular-btn !border-mark !text-mark hover:text-mark me-6 rounded-full focus:ring-0"
      on:click={handleComfirm}>
      {$_('confirm')}
    </Button>
    <Button
      type="button"
      outline
      class="regular-btn rounded-full hover:text-black focus:ring-0"
      on:click={handleCancel}>
      {$_('cancel')}
    </Button>
  </div>
</Modal>

<Modal bind:open={isShowResetModal} size="sm" outsideclose>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('resetDatabaseConfirmation')}
    </h3>
    <Button
      type="button"
      outline
      class="regular-btn !border-mark !text-mark hover:text-mark me-6 rounded-full focus:ring-0"
      on:click={handleResetComfirm}>
      {$_('confirm')}
    </Button>
    <Button
      type="button"
      outline
      class="regular-btn rounded-full hover:text-black focus:ring-0"
      on:click={handleResetCancel}>
      <span>{$_('cancel')}</span>
    </Button>
  </div>
</Modal>

<div class="my-4 flex w-full flex-col items-center text-center">
  <div
    class="to-brand-dark relative my-4 flex w-full flex-col items-center justify-center space-y-8 rounded-lg bg-gradient-to-br from-gray-100 p-8 md:px-4 md:py-6">
    <h2 class="gradient-text typing-text my-4 text-xl text-white">
      {$_('getAIAdviceDescription')}
    </h2>
    <a href="/advice" class="regular-btn hover:text-brand inline-block text-center text-base">
      {$_('getAIAdvice')}
    </a>
  </div>
</div>

<Footer />

<style>
  .typing-text {
    position: relative;
    width: fit-content;
    margin: 0 auto;
    border-right: 2px solid transparent;
    white-space: nowrap;
    overflow: hidden;
    animation:
      typing 8s steps(40, end) infinite,
      blink-caret 0.75s step-end infinite;
  }

  @keyframes typing {
    0% {
      width: 0;
    }
    30% {
      width: 100%;
    }
    80% {
      width: 100%;
    }
    90% {
      width: 0;
    }
    100% {
      width: 0;
    }
  }

  @keyframes blink-caret {
    from,
    to {
      border-color: transparent;
    }
    50% {
      border-color: white;
    }
  }
</style>
