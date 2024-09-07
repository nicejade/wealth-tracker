<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import TableWidget from '../components/ChartWidget/TableWidget.svelte'
  import AreaChart from '../components/ChartWidget/AreaChart.svelte'
  import DonutChart from '../components/ChartWidget/DonutChart.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import { getAssets, getRecords } from '../helper/apis'
  import { ACTION_TYPES } from './../helper/constant'
  import type { RecordsItem } from '../typings'

  let rawWealthArr = []
  let rawRecordsArr = []
  let isShowUpdateModal: boolean = false
  let currentWealthItem
  let updateActionType = ''

  onMount(() => {
    fetchDatabase()
  })

  const fetchDatabase = async () => {
    await fetchWealth()
    await fetchRecords()
  }

  const fetchWealth = async () => {
    try {
      rawWealthArr = (await getAssets()) as any[]
    } catch (error) {
      console.error('Error Fetching Wealth:', error)
    }
  }

  const fetchRecords = async () => {
    try {
      const result: RecordsItem = await getRecords()
      rawRecordsArr = result.data
      const cureentWealthArr = rawWealthArr.map((item) => {
        item.rawDatetime = item.datetime
        item.datetime = dayjs().format('YYYY-MM-DD')
        return item
      })
      rawRecordsArr = rawRecordsArr.concat(cureentWealthArr)
    } catch (error) {
      console.error('Error Fetching Records:', error)
    }
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
  {#if rawWealthArr.length}
    <DonutChart sources={rawWealthArr}></DonutChart>
    <AreaChart sources={rawRecordsArr}></AreaChart>
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
