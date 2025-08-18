<script lang="ts">
  import { onMount } from 'svelte'
  import { params } from '@roxi/routify'
  import { _, locale } from 'svelte-i18n'
  import { Card, Modal, Pagination } from 'flowbite-svelte'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import Wysiwyg from '../components/Wysiwyg.svelte'
  import SvgIcon from '../components/SvgIcon.svelte'
  import Caption from '../components/Caption.svelte'
  import CalendarHeatmap from '../components/CalendarHeatmap.svelte'
  import {
    createInsights,
    getInsights,
    updateInsights,
    destroyInsights,
    getInsightsCalendarData,
  } from '../helper/apis'
  import { notice, alert } from '../stores'
  import type { LinkType } from 'flowbite-svelte'

  let content = ''
  let title = ''
  let insights = []
  let isShowModal = false
  let isShowDeleteModal = false
  let isShowDetailModal = false
  let isShowDayInsightsModal = false
  let editingInsight = null
  let deletingInsightId = null
  let viewingInsight = null
  let selectedDayInsights = []
  let selectedDate = ''
  let page = 1
  let size = 8
  let totalPages = 0
  let pages: LinkType[] = []
  let loading = false
  let calendarData = []
  let calendarLoading = false

  $: {
    page = Math.max(parseInt($params.page || page, 10), 1)
    fetchInsights()
  }

  onMount(() => {
    fetchCalendarData()
  })

  // 获取日历热力图数据
  const fetchCalendarData = async (startDate?: Date, endDate?: Date) => {
    try {
      calendarLoading = true

      // 如果没有提供日期范围，使用当前季度
      if (!startDate || !endDate) {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
        const startMonth = (currentQuarter - 1) * 3
        const endMonth = startMonth + 2

        startDate = new Date(currentYear, startMonth, 1)
        endDate = new Date(currentYear, endMonth + 1, 0)
      }

      const result: any = await getInsightsCalendarData({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      calendarData = result
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      calendarLoading = false
    }
  }

  // 处理日历方格点击
  const handleDayClick = (event: any) => {
    const { date, insights } = event.detail
    selectedDate = date
    selectedDayInsights = insights
    isShowDayInsightsModal = true
  }

  // 处理日期范围变化
  const handleDateRangeChange = (event: any) => {
    const { startDate, endDate } = event.detail
    fetchCalendarData(startDate, endDate)
  }

  const assemblePageData = (result: any) => {
    insights = result.data
    totalPages = Math.ceil(result.total / size)
    if (page > totalPages && totalPages > 0) {
      return updateUrlParams(totalPages)
    }
    pages = assemblePagination(totalPages)
  }

  const fetchInsights = async () => {
    try {
      loading = true
      const result: any = await getInsights({ page, size })
      assemblePageData(result)
    } catch (error) {
      console.error('Error fetching insights:', error)
      alert.set($_('insights.fetchError'))
    } finally {
      loading = false
    }
  }

  const createPageItem = (num: number) => ({
    name: `${num}`,
    active: page === num,
    href: `/insights?page=${num}`,
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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert.set($_('insights.titleContentRequired'))
      return
    }

    try {
      const data = { title: title.trim(), content: content.trim() }

      if (editingInsight) {
        await updateInsights({ ...data, id: editingInsight.id })
        notice.set($_('insights.updateSuccess'))
      } else {
        await createInsights(data)
        notice.set($_('insights.saveSuccess'))
      }

      resetForm()
      fetchInsights()
    } catch (error) {
      console.error('Error saving insight:', error)
      alert.set($_('insights.saveError'))
    }
  }

  const handleView = (insight: any) => {
    viewingInsight = insight
    isShowDetailModal = true
  }

  const handleEdit = (insight: any) => {
    editingInsight = insight
    title = insight.title
    content = insight.content
    isShowModal = true
  }

  const handleDelete = (id: any) => {
    deletingInsightId = id
    isShowDeleteModal = true
  }

  const confirmDelete = async () => {
    try {
      await destroyInsights({ id: deletingInsightId })
      notice.set($_('insights.deleteSuccess'))
      isShowDeleteModal = false
      deletingInsightId = null
      fetchInsights()
    } catch (error) {
      console.error('Error deleting insight:', error)
      alert.set($_('insights.deleteError'))
    }
  }

  const resetForm = () => {
    title = ''
    content = ''
    editingInsight = null
    isShowModal = false
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString($locale)
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    const textContent = content.replace(/<[^>]*>/g, '')
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent
  }
</script>

<Header />

<!-- 日历热力图 -->
<div class="mb-6">
  <CalendarHeatmap
    data={calendarData}
    on:dayClick={handleDayClick}
    on:dateRangeChange={handleDateRangeChange} />
</div>

<Card size="xl" class="w-full max-w-none shadow-none md:p-4 2xl:col-span-2">
  <div class="mb-4 flex justify-between">
    <Caption title={$_('insights.title')}></Caption>
    <button
      class="regular-btn gradient-text hover:border-brand !min-w-10 text-center focus-within:ring-0"
      on:click={() => (isShowModal = true)}>
      {$_('insights.addInsight')}
    </button>
  </div>

  <!-- 见解列表 -->
  <div class="w-full">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="flex items-center space-x-2 text-gray-500">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600">
          </div>
          <span>{$_('insights.loading')}</span>
        </div>
      </div>
    {:else if insights.length === 0}
      <section class="py-12 text-center">
        <div class="my-4 flex w-full items-center justify-center">
          <SvgIcon name="empty" width={184} height={152} />
        </div>
        <button
          class="regular-btn gradient-text hover:border-brand text-center focus-within:ring-0"
          on:click={() => (isShowModal = true)}>
          {$_('insights.createFirstInsight')}
        </button>
      </section>
    {:else}
      <!-- 列表布局 -->
      <div class="space-y-4">
        {#each insights as insight (insight.id)}
          <section
            class="group cursor-pointer rounded-lg shadow transition-all duration-200 hover:border-blue-200 hover:shadow-lg">
            <div
              class="p-6"
              on:click={() => handleView(insight)}
              on:keydown={(e) => e.key === 'Enter' && handleView(insight)}
              role="button"
              tabindex="0">
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <!-- 标题 -->
                  <h3
                    class="group-hover:text-brand mb-0 line-clamp-1 text-lg font-semibold text-gray-900 transition-colors dark:text-white">
                    {insight.title}
                  </h3>
                  <!-- 操作按钮 -->
                  <div class="ml-4 flex space-x-2">
                    <button
                      class="focus:ring-link inline-flex items-center justify-center rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2"
                      on:click|stopPropagation={() => handleEdit(insight)}>
                      <SvgIcon name="edit" width={20} height={20} color="currentColor" />
                    </button>
                    <button
                      class="focus:ring-link inline-flex items-center justify-center rounded-md p-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2"
                      on:click|stopPropagation={() => handleDelete(insight.id)}>
                      <SvgIcon name="trash" width={20} height={20} color="currentColor" />
                    </button>
                  </div>
                </div>

                <!-- 内容预览 -->
                <div
                  class="prose prose-base mb-3 line-clamp-2 max-w-none text-gray-600 dark:text-gray-300">
                  {truncateContent(insight.content, 150)}
                </div>
                <!-- 时间信息 -->
                <div class="text-xs text-gray-500">
                  {$_('insights.createdAt')}
                  {formatDate(insight.created)}
                  {#if insight.updated !== insight.created}
                    · {$_('insights.updatedAt')} {formatDate(insight.updated)}
                  {/if}
                </div>
              </div>
            </div>
          </section>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 分页 -->
  {#if totalPages > 1}
    <div class="my-6 flex items-center justify-center">
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
  {/if}
</Card>

<!-- 新增/编辑模态框 -->
<Modal bind:open={isShowModal} size="lg" autoclose={false} class="w-full">
  <section class="flex flex-col space-y-6 px-6">
    <h2 class="text-xl font-medium text-gray-900 dark:text-white">
      <SvgIcon name="edit" width={20} height={20} color="#1e293b" />
      {editingInsight ? $_('insights.editInsight') : $_('insights.addInsight')}
    </h2>
    <input
      type="text"
      id="modal-title"
      bind:value={title}
      class="custom-input"
      placeholder={$_('insights.titlePlaceholder')}
      required />
    <div>
      <Wysiwyg bind:content />
    </div>
    <div class="flex justify-center space-x-6">
      <button type="button" outline class="cancel-btn" on:click={resetForm}>{$_('cancel')}</button>
      <button type="button" outline class="comfirm-btn" on:click={handleSave}>
        {editingInsight ? $_('update') : $_('insights.save')}
      </button>
    </div>
  </section>
</Modal>

<!-- 详情查看模态框 -->
<Modal bind:open={isShowDetailModal} size="lg" autoclose={false} class="w-full">
  {#if viewingInsight}
    <div class="flex flex-col space-y-6 px-6 py-0">
      <div class="flex items-start justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {viewingInsight.title}
        </h2>
      </div>

      <div class="prose prose-sm max-w-none text-gray-700">
        {@html viewingInsight.content}
      </div>

      <div class="flex items-center justify-between border-t pt-4 text-sm text-gray-500">
        <span>{$_('insights.createTime')}{formatDate(viewingInsight.created)}</span>
        {#if viewingInsight.updated !== viewingInsight.created}
          <span>{$_('insights.updateTime')}{formatDate(viewingInsight.updated)}</span>
        {/if}
      </div>
    </div>
  {/if}
</Modal>

<!-- 删除确认模态框 -->
<Modal bind:open={isShowDeleteModal} size="sm" autoclose={false}>
  <div class="text-center">
    <div class="mx-auto mb-4">
      <SvgIcon name="warning" width={36} height={36} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">{$_('insights.deleteConfirmTitle')}</h3>
    <div class="flex justify-center space-x-4">
      <button class="comfirm-btn" on:click={confirmDelete}>{$_('confirm')}</button>
      <button class="cancel-btn" on:click={() => (isShowDeleteModal = false)}>
        {$_('cancel')}
      </button>
    </div>
  </div>
</Modal>

<!-- 当日见解模态框 -->
<Modal bind:open={isShowDayInsightsModal} size="lg" autoclose={false} class="w-full">
  <div class="flex flex-col space-y-6 px-6 py-0">
    <div class="flex items-start justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        {$_('insights.dayInsights')} - {selectedDate
          ? new Date(selectedDate).toLocaleDateString($locale)
          : ''}
      </h2>
    </div>

    {#if selectedDayInsights.length === 0}
      <div class="py-8 text-center text-gray-500">
        {$_('insights.noInsightsOnThisDay')}
      </div>
    {:else}
      <div class="max-h-96 space-y-4 overflow-y-auto">
        {#each selectedDayInsights as insight (insight.id)}
          <div class="rounded-lg border border-gray-200 p-4">
            <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            <div class="prose prose-sm max-w-none text-gray-700">
              {@html insight.content}
            </div>
            <div class="mt-2 text-xs text-gray-500">
              {formatDate(insight.created)}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="flex justify-center">
      <button class="cancel-btn" on:click={() => (isShowDayInsightsModal = false)}>
        {$_('close')}
      </button>
    </div>
  </div>
</Modal>

<Footer />

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
