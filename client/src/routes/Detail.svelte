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
  import type { LinkType } from 'flowbite-svelte'

  let page: number = 1
  let size: number = 10
  let rawRecordsArr = []
  let pages: LinkType[] = []
  let totalPages: number = 0
  let isShowUpdateModal: boolean = false
  let currentWealthItem
  let updateActionType = ACTION_TYPES.change

  $: {
    page = Math.max(parseInt($params.page, 10) || page, 1)
    fetchRecords()
  }

  const createPageItem = (num: number) => ({
    name: `${num}`,
    active: page === num,
    href: `/detail?page=${num}`,
  })

  const createEllipsis = () => ({ name: '...', href: '', active: false })

  const createFullPagination = (total: number) =>
    Array.from({ length: total }, (_, i) => createPageItem(i + 1))

  const createStartPagination = () => [
    createPageItem(1),
    ...Array.from({ length: 4 }, (_, i) => createPageItem(i + 2)),
    createEllipsis(),
    createPageItem(totalPages),
  ]

  const createEndPagination = () => [
    createPageItem(1),
    createEllipsis(),
    ...Array.from({ length: 4 }, (_, i) => createPageItem(totalPages - 4 + i)),
    createPageItem(totalPages),
  ]

  const createMiddlePagination = () => [
    createPageItem(1),
    createEllipsis(),
    createPageItem(page - 1),
    createPageItem(page),
    createPageItem(page + 1),
    createEllipsis(),
    createPageItem(totalPages),
  ]

  const assemblePagination = (total: number) => {
    const MAX_VISIBLE_PAGE = 7
    const SUBTLE_NUMBER = Math.ceil(MAX_VISIBLE_PAGE / 2)
    if (total <= MAX_VISIBLE_PAGE) return createFullPagination(total)
    if (page <= SUBTLE_NUMBER) return createStartPagination()
    if (page > total - SUBTLE_NUMBER) return createEndPagination()
    return createMiddlePagination()
  }

  const assemblePageData = (result: RecordsItem) => {
    rawRecordsArr = result.data
    totalPages = Math.ceil(result.total / size)
    if (page > totalPages) {
      return updateUrlParams(totalPages)
    }
    pages = assemblePagination(totalPages)
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
      updateUrlParams(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      updateUrlParams(page + 1)
    }
  }

  const updateUrlParams = (cpage: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', cpage.toString())
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
