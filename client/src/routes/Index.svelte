<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { CardPlaceholder } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import TableWidget from '../components/ChartWidget/TableWidget.svelte'
  import AreaChart from '../components/ChartWidget/AreaChart.svelte'
  import DonutChart from '../components/ChartWidget/DonutChart.svelte'
  import BindingChart from '../components/ChartWidget/BindingChart.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import { getAssets, getRecords } from '../helper/apis'
  import { ACTION_TYPES } from './../helper/constant'
  import type { WealthItem, RecordsItem } from '../typings'

  let rawWealthArr = []
  let rawRecordsArr = []
  let currentWealthItem: WealthItem
  let updateActionType: string = ''
  let isShowUpdateModal: boolean = false
  let isShowChart: boolean = false

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

  const handleUpdateConfirm = () => {
    fetchDatabase()
  }

  const handleUpate = (event) => {
    currentWealthItem = event.detail
    updateActionType = ACTION_TYPES.update
    isShowUpdateModal = true
  }

  const handleAdd = () => {
    currentWealthItem = {
      type: '',
      amount: 0,
      currency: 'CNY',
      risk: 'LOW',
      liquidity: 'GOOD',
      note: '',
      datetime: new Date().toISOString().split('T')[0],
    }
    updateActionType = ACTION_TYPES.create
    isShowUpdateModal = true
  }

  const handleUpdateClose = () => {
    isShowUpdateModal = false
  }
</script>

<Header />
<div class="flex w-full flex-col items-center justify-center space-y-8">
  <TableWidget options={rawWealthArr} on:update={handleUpate} on:add={handleAdd} />
  {#if isShowChart}
    <DonutChart sources={rawWealthArr}></DonutChart>
    <AreaChart sources={rawRecordsArr}></AreaChart>
    <BindingChart sources={rawRecordsArr}></BindingChart>
  {:else}
    <CardPlaceholder size="lg" class="w-full max-w-full" />
  {/if}
</div>

{#if isShowUpdateModal}
  <UpdateModal
    action={updateActionType}
    items={currentWealthItem}
    on:confirm={handleUpdateConfirm}
    on:close={handleUpdateClose} />
{/if}
<Footer />
