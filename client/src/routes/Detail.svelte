<script lang="ts">
  import { params } from '@roxi/routify'
  import { Pagination } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import DetailTable from '../components/DetailTable.svelte'
  import UpdateModal from '../components/Modal/Update.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'
  import { getRecords, destroyRecords } from '../helper/apis'
  import { ACTION_TYPES } from './../helper/constant'
  import { notice } from '../stores'
  import type { RecordsItem } from '../typings'

  let page: number = 1
  let size: number = 10
  let rawRecordsArr = []
  let pages = []
  let isShowUpdateModal: boolean = false
  let currentWealthItem
  let updateActionType = ACTION_TYPES.change

  $: {
    page = parseInt($params.page, 10) || page
    fetchRecords()
  }

  const assemblePageData = (result: RecordsItem) => {
    rawRecordsArr = result.data
    const pagination = Math.ceil(result.total / size)
    pages = Array.from({ length: pagination }, (_, i) => ({
      name: i + 1,
      active: page === i + 1,
      href: `/detail?page=${i + 1}`,
    }))
  }

  const fetchRecords = async () => {
    try {
      const result: RecordsItem = await getRecords({ page, size })
      assemblePageData(result)
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

  const handlePrevious = () => {
    if (page > 1) {
      page -= 1
      updateURL()
    }
  }

  const handleNext = () => {
    page += 1
    updateURL()
  }

  const updateURL = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.history.pushState({}, '', url.toString())
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

<div class="my-6 flex items-center justify-center rtl:space-x-reverse">
  <Pagination
    {pages}
    large
    on:previous={handlePrevious}
    on:next={handleNext}
    activeClass="text-brand">
    <svelte:fragment slot="prev">
      <span class="sr-only">Previous</span>
      <SvgIcon name="chevron-left" />
    </svelte:fragment>
    <svelte:fragment slot="next">
      <span class="sr-only">Next</span>
      <SvgIcon name="chevron-right" />
    </svelte:fragment>
  </Pagination>
</div>

<Footer />
