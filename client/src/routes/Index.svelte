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

  let rawWealthArr = []
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
      rawWealthArr = results[0] as any[]
      const records: RecordsItem = results[1]
      rawRecordsArr = records.data
      updateRawRecords()
    } catch (error) {
      console.error('Error Fetching Data:', error)
    }
  }

  const updateRawRecords = async () => {
    const currentWealthArr = rawWealthArr.map((item) => {
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
    options={rawWealthArr}
    on:add={handleAdd}
    on:update={handleUpate}
    on:destroy={handleDestroy}
    on:reset={handleReset} />
  {#if !isShowChart}
    <CardPlaceholder size="lg" class="w-full max-w-full" />
  {/if}

  {#if isShowChart && rawWealthArr.length}
    <DonutChart sources={rawWealthArr}></DonutChart>
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

<Modal bind:open={isShowComfirmModal} size="sm" autoclose={false}>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#f59e0b" />
    </div>
    <h3 class="text-grey mb-5 text-lg font-normal">
      {$_('destroyAccountConfirmation')}
    </h3>
    <Button color="red" class="me-6 focus:ring-0" on:click={handleComfirm}>
      {$_('confirm')}
    </Button>
    <Button color="alternative" class="focus:ring-0" on:click={handleCancel}>
      {$_('cancel')}
    </Button>
  </div>
</Modal>

<Modal bind:open={isShowResetModal} size="sm" autoclose={false}>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={30} height={30} color="#c81e1d" />
    </div>
    <h3 class="text-grey mb-5 text-lg font-normal">
      {$_('resetDatabaseConfirmation')}
    </h3>
    <Button color="red" class="me-6 focus:ring-0" on:click={handleResetComfirm}>
      {$_('confirm')}
    </Button>
    <Button color="alternative" class="focus:ring-0" on:click={handleResetCancel}>
      {$_('cancel')}
    </Button>
  </div>
</Modal>

<Footer />
