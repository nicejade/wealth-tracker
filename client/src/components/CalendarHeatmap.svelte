<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { _ } from 'svelte-i18n'
  import dayjs from 'dayjs'
  import CustomSelect from './Select.svelte'
  import type { SelectItem } from '../typings'

  export let data: Array<{ date: string; count: number; insights: any[] }> = []

  const dispatch = createEventDispatcher()

  // 生成年份选项（过去12年）
  const generateYearOptions = (): SelectItem[] => {
    const currentYear = dayjs().year()
    const years: SelectItem[] = []
    for (let i = 0; i < 12; i++) {
      const year = currentYear - i
      years.push({
        name: year.toString(),
        value: year.toString(),
      })
    }
    return years
  }

  // 生成季度选项
  const generateQuarterOptions = (): SelectItem[] => {
    return [
      { name: '1', value: '1' },
      { name: '2', value: '2' },
      { name: '3', value: '3' },
      { name: '4', value: '4' },
    ]
  }

  // 年份和季度选择
  let yearOptions = generateYearOptions()
  let quarterOptions = generateQuarterOptions()
  let selectedYear = dayjs().year()
  let selectedYearActive: number = 0
  let selectedQuarter = Math.ceil((dayjs().month() + 1) / 3)
  let calendarGrid = []
  $: if (data) {
    calendarGrid = generateCalendarGrid()
  }
  $: weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // 根据年份和季度计算日期范围
  const calculateDateRange = (year: number, quarter: number) => {
    const startMonth = (quarter - 1) * 3
    const endMonth = startMonth + 2

    let startDate = new Date(year, startMonth, 1)
    let endDate = new Date(year, endMonth + 1, 0) // 下个月的第0天 = 当月最后一天

    const currentDate = dayjs()

    // 如果计算的结束日期超过当前日期，则以当前日期为结束日期，向前推算一个季度
    if (dayjs(endDate).isAfter(currentDate)) {
      endDate = currentDate.toDate()
      // 向前推算3个月（一个季度）
      startDate = currentDate.subtract(3, 'month').toDate()
    }

    return { startDate, endDate }
  }

  // 处理年份选择
  const handleYearSelect = (event: any) => {
    selectedYear = parseInt(event.detail.value)
    selectedYearActive = yearOptions.findIndex((item) => item.value === event.detail.value)
    updateDateRange()
  }

  // 处理季度选择
  const handleQuarterSelect = (event: any) => {
    selectedQuarter = parseInt(event.detail.value)
    updateDateRange()
  }

  // 更新日期范围并触发数据更新
  const updateDateRange = () => {
    const { startDate, endDate } = calculateDateRange(selectedYear, selectedQuarter)
    dispatch('dateRangeChange', { startDate, endDate })
  }

  // 生成日期网格
  const generateCalendarGrid = () => {
    const { startDate: start, endDate: end } = calculateDateRange(selectedYear, selectedQuarter)

    // 找到开始日期所在周的周一
    const startOfWeek = dayjs(start)
    const dayOfWeek = startOfWeek.day()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const adjustedStartOfWeek = startOfWeek.subtract(daysToSubtract, 'day')

    let current = adjustedStartOfWeek
    const weeks = []

    while (current.isBefore(dayjs(end)) || current.isSame(dayjs(end))) {
      const week = []
      for (let i = 0; i < 7; i++) {
        // 使用 dayjs 格式化日期，避免时区问题
        const dateStr = current.format('YYYY-MM-DD')
        const dayData = data.find((d) => d.date === dateStr)

        week.push({
          date: current.toDate(),
          dateStr,
          count: dayData?.count || 0,
          insights: dayData?.insights || [],
          isInRange:
            (current.isAfter(dayjs(start)) || current.isSame(dayjs(start))) &&
            (current.isBefore(dayjs(end)) || current.isSame(dayjs(end))),
        })

        current = current.add(1, 'day')
      }
      weeks.push(week)
    }

    return weeks
  }

  // 根据数量获取颜色强度
  const getIntensity = (count: number) => {
    if (count === 0) return 0
    if (count <= 1) return 1
    if (count <= 3) return 2
    if (count <= 5) return 3
    return 4
  }

  // 获取颜色类名
  const getColorClass = (intensity: number) => {
    const colors = [
      'bg-gray-100 border-gray-200', // 0 - 无数据
      'bg-brand/20 border-brand/30', // 1 - 很少
      'bg-brand/40 border-brand/50', // 2 - 少
      'bg-brand/60 border-brand/70', // 3 - 中等
      'bg-brand/80 border-brand/90', // 4 - 很多
    ]
    return colors[intensity] || colors[0]
  }

  // 处理方格点击
  const handleCellClick = (dayData: any) => {
    if (dayData.isInRange && dayData.count > 0) {
      dispatch('dayClick', {
        date: dayData.dateStr,
        count: dayData.count,
        insights: dayData.insights,
      })
    }
  }

  // 格式化日期显示
  const formatDate = (date: Date) => {
    return dayjs(date).format('MMM D')
  }
</script>

<!-- 日历热力图组件 - 仅在非移动端显示 -->
<div class="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:hidden">
  <!-- 标题和控制器 -->
  <div class="mb-6 flex items-center justify-between">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
      {$_('insights.calendarTitle')}
    </h3>

    <!-- 年份和季度选择器 -->
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <CustomSelect
          options={yearOptions}
          active={selectedYearActive}
          label={$_('insights.year')}
          listboxClass="w-24"
          on:selected={handleYearSelect} />
        <CustomSelect
          options={quarterOptions}
          active={selectedQuarter - 1}
          label={$_('insights.quarter')}
          listboxClass="w-20"
          on:selected={handleQuarterSelect} />
      </div>

      <!-- 颜色强度说明 -->
      <div class="flex items-center space-x-3 text-sm text-gray-500">
        <span class="text-xs">{$_('insights.less')}</span>
        <div class="flex space-x-1">
          {#each [0, 1, 2, 3, 4] as intensity}
            <div
              class="h-3 w-3 rounded-sm border transition-all duration-200 hover:scale-110 {getColorClass(
                intensity,
              )}">
            </div>
          {/each}
        </div>
        <span class="text-xs">{$_('insights.more')}</span>
      </div>
    </div>
  </div>

  <!-- 日历网格 -->
  <div class="w-full">
    <!-- 星期标签和日期网格 -->
    <div class="flex">
      <!-- 星期标签 -->
      <div class="mr-2 flex h-full w-12 flex-col justify-evenly gap-3">
        {#each weekDays as day, index}
          <div
            class="flex h-8 items-center text-xs font-extrabold text-gray-500 {index % 2 === 0
              ? 'opacity-100'
              : 'opacity-0'}">
            {day}
          </div>
        {/each}
      </div>

      <!-- 日期网格 -->
      <div class="flex justify-between gap-3" style="width: calc(100% - 3rem);">
        {#each calendarGrid as week}
          <div class="flex min-w-0 flex-1 flex-col gap-3">
            {#each week as day}
              <div
                class="group relative aspect-square h-8 min-h-4 w-full cursor-pointer rounded border transition-all duration-200 hover:z-10 hover:scale-110 hover:shadow-md {getColorClass(
                  getIntensity(day.count),
                )} {day.isInRange ? '' : 'opacity-30'} {day.count > 0 && day.isInRange
                  ? 'hover:border-brand'
                  : ''}"
                on:click={() => handleCellClick(day)}
                on:keydown={(e) => e.key === 'Enter' && handleCellClick(day)}
                role="button"
                tabindex="0"
                title="{formatDate(day.date)}: {day.count} {$_('insights.insightsCount')}">
                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  <div class="whitespace-nowrap">
                    {formatDate(day.date)}
                  </div>
                  <div class="whitespace-nowrap">
                    {day.count}
                    {$_('insights.insightsCount')}
                  </div>
                  <!-- 箭头 -->
                  <div
                    class="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900">
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
