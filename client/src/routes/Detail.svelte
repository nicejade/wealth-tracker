<script lang="ts">
  import { onMount } from 'svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import DetailTable from '../components/DetailTable.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import { getRecords, destroyRecords } from '../helper/apis'
  import { ACTION_TYPES } from './../helper/constant'
  import { notice } from '../stores'

  let rawRecordsArr = []
  let isShowUpdateModal: boolean = false
  let currentWealthItem
  let updateActionType = ACTION_TYPES.change

  onMount(() => {
    fetchRecords()
  })

  const fetchRecords = async () => {
    try {
      rawRecordsArr = await getRecords()
      rawRecordsArr = rawRecordsArr.reverse()
    } catch (error) {
      console.error('Error Fetching Records:', error)
    }
  }

  const handleChange = (event) => {
    currentWealthItem = event.detail
    isShowUpdateModal = true
  }

  const destroyChange = async (event) => {
    await destroyRecords(event.detail)
    notice.set('该记录已成功销毁.')
    fetchRecords()
  }

  const handleChangeConfirm = () => {
    fetchRecords()
  }

  const handleChangeClose = () => {
    isShowUpdateModal = false
  }
</script>

<Header />
<div class="flex w-full flex-col items-center justify-center">
  <DetailTable options={rawRecordsArr} on:change={handleChange} on:destroy={destroyChange} />
</div>

{#if isShowUpdateModal}
  <UpdateModal
    action={updateActionType}
    items={currentWealthItem}
    on:confirm={handleChangeConfirm}
    on:close={handleChangeClose} />
{/if}
<Footer />
