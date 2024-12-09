<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { _ } from 'svelte-i18n'
  import { CardPlaceholder } from 'flowbite-svelte'
  import { Button, Modal } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import TableWidget from '../components/ChartWidget/TableWidget.svelte'
  import AreaChart from '../components/ChartWidget/AreaChart.svelte'
  import DonutChart from '../components/ChartWidget/DonutChart.svelte'
  import BindingChart from '../components/ChartWidget/BindingChart.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'
  import { getAssets, destroyAssets, getRecords, resetDatabase } from '../helper/apis'
  import { ACTION_TYPES, DEFAULT_ACCOUNT_ITEM } from './../helper/constant'
  import type { AssetsItem, RecordsItem } from '../typings'

  let rawAssetsArr = []
  let rawRecordsArr = []
  let currentAssetItem: AssetsItem
  let updateActionType: string = ''
  let isShowUpdateModal: boolean = false
  let isShowComfirmModal: boolean = false
  let isShowResetModal: boolean = false
  let isShowChart: boolean = false
  let typeToBeDestroyed: string = ''

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
    const currentWealthArr = rawAssetsArr.map((item) => {
      item.rawDatetime = item.datetime
      item.datetime = dayjs().format('YYYY-MM-DD')
      return item
    })
    rawRecordsArr = rawRecordsArr.concat(currentWealthArr)
    isShowChart = true
  }

  const handleAdd = () => {
    currentAssetItem = DEFAULT_ACCOUNT_ITEM
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
  <TableWidget
    options={rawAssetsArr}
    on:add={handleAdd}
    on:update={handleUpate}
    on:destroy={handleDestroy}
    on:reset={handleReset} />
  {#if !isShowChart}
    <CardPlaceholder size="lg" class="w-full max-w-full" />
  {/if}

  {#if isShowChart && rawAssetsArr.length}
    <DonutChart sources={rawAssetsArr}></DonutChart>
    <AreaChart sources={rawRecordsArr}></AreaChart>
    <BindingChart sources={rawRecordsArr}></BindingChart>
  {/if}
</div>

{#if isShowUpdateModal}
  <UpdateModal
    action={updateActionType}
    items={currentAssetItem}
    on:confirm={handleUpdateConfirm}
    on:close={handleUpdateClose} />
{/if}

<Modal bind:open={isShowComfirmModal} size="sm" autoclose>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('destroyAccountConfirmation')}
    </h3>
    <Button
      color="alternative"
      class="border-mark text-mark me-6 focus:ring-0"
      on:click={handleComfirm}>
      {$_('confirm')}
    </Button>
    <Button color="alternative" class="focus:ring-0" on:click={handleCancel}>
      {$_('cancel')}
    </Button>
  </div>
</Modal>

<Modal bind:open={isShowResetModal} size="sm" autoclose>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#c81e1d" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('resetDatabaseConfirmation')}
    </h3>
    <Button
      color="alternative"
      class="border-mark text-mark me-6 focus:ring-0"
      on:click={handleResetComfirm}>
      {$_('confirm')}
    </Button>
    <Button color="alternative" class="focus:ring-0" on:click={handleResetCancel}>
      {$_('cancel')}
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
