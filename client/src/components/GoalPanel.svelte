<script lang="ts">
  import { onMount } from 'svelte'
  import dayjs from 'dayjs'
  import { _ } from 'svelte-i18n'
  import { Modal } from 'flowbite'
  import { Button, Card, Modal as SvelteModal } from 'flowbite-svelte'
  import type { ModalOptions } from 'flowbite'
  import confetti from 'canvas-confetti'
  import Caption from './Caption.svelte'
  import SvgIcon from './SvgIcon.svelte'
  import CustomSelect from './Select.svelte'
  import { createGoal, getGoals, updateGoal, destroyGoal } from './../helper/apis'
  import { DEFAULT_GOAL_ITEM, getAllCurrencies } from './../helper/constant'
  import {
    convertCurrency,
    deepClone,
    fillMissingAssetsArr,
    getCurrencySymbol,
    groupArrayByType,
    sortByDatetime,
  } from './../helper/utils'
  import { trackEvent } from './../helper/analytics'
  import {
    alert,
    customCurrencies,
    exchangeRates,
    netWorthValue,
    targetCurrencyCode,
  } from './../stores'
  import type { GoalItem } from './../typings'

  // Converted records (negative amounts = liabilities) used to estimate net worth trend.
  export let records = []

  const FORECAST_WINDOW_DAYS = 91
  const celebratedGoalIds = new Set<number>()

  let goals: GoalItem[] = []
  let isShowGoalModal = false
  let isShowDeleteModal = false
  let isEditing = false
  let editingItem = deepClone(DEFAULT_GOAL_ITEM)
  let idToBeDeleted = 0
  let dailyGrowth = 0

  $: supportedCurrencys = getAllCurrencies($customCurrencies).map((item) => ({
    name: item.isCustom
      ? (item as any).name || item.value
      : $_(`currencys.${item.value}`) || item.value,
    value: item.value,
  }))

  $: if (records.length > 0) {
    dailyGrowth = computeDailyGrowth(records)
  }

  $: enrichedGoals = goals.map((goal) => {
    const target = convertCurrency(goal.amount, goal.currency, $targetCurrencyCode, $exchangeRates)
    const progress = target > 0 ? ($netWorthValue / target) * 100 : 0
    return {
      ...goal,
      convertedTarget: target,
      progress,
      forecastDate: genForecastDate(target, dailyGrowth),
    }
  })

  $: celebrateAchievedGoals(enrichedGoals)

  onMount(() => {
    fetchGoals()
  })

  const fetchGoals = async () => {
    try {
      goals = ((await getGoals()) as GoalItem[]) || []
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  /**
   * Estimate the average daily net worth growth over the recent window,
   * mirroring how AreaChart aggregates per-account series.
   */
  const computeDailyGrowth = (sources) => {
    const start = dayjs()
      .subtract(FORECAST_WINDOW_DAYS - 1, 'day')
      .format('YYYY-MM-DD')
    const sorted = sortByDatetime([...sources])
    const grouped = groupArrayByType(sorted)
    let firstSum = 0
    let lastSum = 0
    grouped.forEach((items: any) => {
      const filled = fillMissingAssetsArr(items.array, start)
      const windowArr = filled.filter((item) => dayjs(item.datetime) >= dayjs(start))
      if (windowArr.length === 0) return
      firstSum += windowArr[0].amount || 0
      lastSum += windowArr[windowArr.length - 1].amount || 0
    })
    return (lastSum - firstSum) / Math.max(FORECAST_WINDOW_DAYS - 1, 1)
  }

  const genForecastDate = (target: number, growthPerDay: number): string => {
    const remaining = target - $netWorthValue
    if (remaining <= 0 || growthPerDay <= 0) return ''
    const etaDays = Math.ceil(remaining / growthPerDay)
    // Beyond a century the projection is meaningless noise.
    if (etaDays > 36500) return ''
    return dayjs().add(etaDays, 'day').format('YYYY-MM-DD')
  }

  const celebrateAchievedGoals = (items) => {
    items.forEach((goal) => {
      if (goal.progress < 100 || goal.achievedAt || celebratedGoalIds.has(goal.id)) return
      celebratedGoalIds.add(goal.id)
      confetti({
        particleCount: 199,
        spread: 99,
        origin: { y: 0.6 },
      })
      updateGoal({ id: goal.id, achievedAt: new Date().toISOString() })
        .then(() => fetchGoals())
        .catch((error) => console.error('Error marking goal as achieved:', error))
      trackEvent('goal-achieved', { goal_id: goal.id })
    })
  }

  const handleAdd = () => {
    editingItem = deepClone(DEFAULT_GOAL_ITEM)
    editingItem.currency = $targetCurrencyCode
    isEditing = false
    isShowGoalModal = true
    trackEvent('goal-add-click')
  }

  const handleEdit = (goal: GoalItem) => {
    editingItem = {
      id: goal.id,
      name: goal.name,
      amount: Number(goal.amount),
      currency: goal.currency,
      deadline: goal.deadline || '',
    }
    isEditing = true
    isShowGoalModal = true
  }

  const handleDelete = (goal: GoalItem) => {
    idToBeDeleted = goal.id
    isShowDeleteModal = true
  }

  const handleDeleteConfirm = async () => {
    try {
      await destroyGoal({ id: idToBeDeleted })
      celebratedGoalIds.delete(idToBeDeleted)
      isShowDeleteModal = false
      trackEvent('goal-delete', { goal_id: idToBeDeleted })
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleGoalConfirm = async () => {
    if (!editingItem.name || !editingItem.name.trim()) {
      alert.set($_('goal.nameRequiredTip'))
      return
    }
    if (!(Number(editingItem.amount) > 0)) {
      alert.set($_('goal.amountRequiredTip'))
      return
    }
    if (editingItem.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(editingItem.deadline)) {
      alert.set($_('fillValidDateTip'))
      return
    }
    try {
      if (isEditing) {
        await updateGoal({ ...editingItem, achievedAt: null })
        celebratedGoalIds.delete(editingItem.id)
      } else {
        await createGoal(editingItem)
      }
      isShowGoalModal = false
      trackEvent(isEditing ? 'goal-update' : 'goal-create')
      fetchGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert.set(error.message || $_('goal.saveFailed'))
    }
  }

  const handleCurrencySelect = (event) => {
    editingItem.currency = event.detail.value
  }

  const genCurrencyActive = (currency) => {
    return supportedCurrencys.findIndex((item) => item.value === currency)
  }

  const isOverdueRisk = (goal): boolean => {
    if (!goal.deadline || !goal.forecastDate || goal.progress >= 100) return false
    return dayjs(goal.forecastDate).isAfter(dayjs(goal.deadline), 'day')
  }

  const GOAL_MODAL_KEY = 'goal-modal'

  const goalModalAction = (node: HTMLElement) => {
    const options: ModalOptions = {
      placement: 'top-center',
      backdropClasses: 'fixed inset-0 z-40',
      backdrop: 'static',
      closable: true,
      onHide: () => {
        isShowGoalModal = false
      },
    }
    const modal = new Modal(node, options)
    modal.show()
    return {
      destroy() {
        modal.hide()
      },
    }
  }

  const closeGoalModal = () => {
    isShowGoalModal = false
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none md:p-4 2xl:col-span-2">
  <div class="mb-4 flex flex-row gap-3 sm:flex-row sm:items-start sm:justify-between">
    <Caption title={$_('goal.title')} subtitle={$_('goal.subtitle')}></Caption>
    <button
      type="button"
      class="regular-btn h-10 !px-4 !py-0 focus-visible-ring !min-w-fit"
      on:click={handleAdd}>
      {$_('goal.addGoal')}
    </button>
  </div>

  {#if enrichedGoals.length === 0}
    <p class="text-grey py-6 text-center text-base">{$_('goal.emptyTip')}</p>
  {:else}
    <div class="flex flex-col space-y-6">
      {#each enrichedGoals as goal (goal.id)}
        <div class="rounded-lg border border-gray-200 p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center space-x-2">
              <strong class="text-base text-black">{goal.name}</strong>
              {#if goal.progress >= 100}
                <span
                  class="border-success text-success inline-flex items-center rounded-sm border bg-green-50 px-1 py-0.5 text-xs font-medium">
                  {$_('goal.achieved')}
                </span>
              {/if}
            </div>
            <div class="flex items-center">
              <Button
                size="sm"
                outline
                class="border-none focus:ring-0"
                on:click={() => handleEdit(goal)}>
                <span class="hover:text-brand text-mark">{$_('update')}</span>
              </Button>
              <Button
                size="sm"
                outline
                class="border-none focus:ring-0"
                on:click={() => handleDelete(goal)}>
                <span class="hover:text-brand text-mark">{$_('destroy')}</span>
              </Button>
            </div>
          </div>

          <div class="mt-3 flex items-center space-x-3">
            <div class="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                class="bg-brand h-full rounded-full transition-all duration-500"
                style="width: {Math.max(Math.min(goal.progress, 100), 0)}%">
              </div>
            </div>
            <strong class="text-brand min-w-[64px] text-right text-sm">
              {goal.progress.toFixed(1)}%
            </strong>
          </div>

          <div class="text-grey mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span>
              {$_('goal.targetAmount')}:
              <strong class="text-blue">
                {getCurrencySymbol(goal.currency, $customCurrencies)}{goal.amount}
              </strong>
            </span>
            {#if goal.progress < 100}
              <span>
                {$_('goal.forecastDate')}:
                {#if goal.forecastDate}
                  <strong class={isOverdueRisk(goal) ? 'text-mark' : 'text-blue'}>
                    {goal.forecastDate}
                  </strong>
                {:else}
                  <strong class="text-grey">{$_('goal.noForecast')}</strong>
                {/if}
              </span>
            {/if}
            {#if goal.deadline}
              <span>
                {$_('goal.deadline')}:
                <strong class="text-blue">{goal.deadline}</strong>
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Card>

{#if isShowGoalModal}
  <div
    id={GOAL_MODAL_KEY}
    use:goalModalAction
    tabindex="-1"
    class="z-9999 fixed left-0 right-0 top-0 hidden h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full">
    <div class="relative h-full w-full max-w-lg md:h-auto md:max-w-md">
      <div class="relative mt-16 rounded-lg bg-white pb-8 shadow">
        <div class="flex items-center justify-between rounded-t border-b p-5">
          <h3 class="flex items-center text-lg font-medium text-gray-900 md:text-base">
            <SvgIcon name="adjustment" width={20} height={20} color="#1e293b" />
            {isEditing ? $_('goal.editGoal') : $_('goal.addGoal')}
          </h3>
          <button
            type="button"
            on:click={closeGoalModal}
            class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
            <SvgIcon name="close" width={20} height={20} />
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <div class="flex flex-col items-center justify-center p-6">
          <div class="module-warp">
            <label for="goal-name" class="custom-label">
              {$_('goal.name')}
              <i class="text-mark">*</i>
            </label>
            <input
              type="text"
              id="goal-name"
              bind:value={editingItem.name}
              class="custom-input"
              placeholder={$_('goal.namePlaceholder')}
              required />
          </div>
          <div class="module-warp">
            <label for="goal-amount" class="custom-label">
              {$_('goal.targetAmount')}
              <i class="text-mark">*</i>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="goal-amount"
              bind:value={editingItem.amount}
              class="custom-input"
              placeholder={$_('goal.amountPlaceholder')}
              required />
          </div>
          <div class="module-warp">
            <label for="goal-currency" class="custom-label">
              {$_('currency')}
            </label>
            <div class="w-full">
              <CustomSelect
                options={supportedCurrencys}
                active={genCurrencyActive(editingItem.currency)}
                listboxClass="w-full"
                on:selected={handleCurrencySelect} />
            </div>
          </div>
          <div class="module-warp">
            <label for="goal-deadline" class="custom-label">
              {$_('goal.deadline')}
            </label>
            <input
              type="text"
              id="goal-deadline"
              bind:value={editingItem.deadline}
              class="custom-input"
              placeholder={$_('goal.deadlinePlaceholder')} />
          </div>
        </div>
        <div class="flex items-center justify-center">
          <button type="button" on:click={handleGoalConfirm} class="regular-btn">
            {$_('confirm')}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<SvelteModal bind:open={isShowDeleteModal} size="sm" outsideclose class="bg-white shadow-lg">
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={36} height={36} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('goal.deleteConfirmation')}
    </h3>
    <div class="flex justify-center space-x-6">
      <button type="button" class="comfirm-btn" on:click={handleDeleteConfirm}>
        {$_('confirm')}
      </button>
      <button type="button" class="cancel-btn" on:click={() => (isShowDeleteModal = false)}>
        {$_('cancel')}
      </button>
    </div>
  </div>
</SvelteModal>
