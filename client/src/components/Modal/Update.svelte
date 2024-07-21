<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
  import { Modal } from 'flowbite'
  import SvgIcon from '../SvgIcon.svelte'
  import CustomSelect from './../Select.svelte'
  import { create, update } from './../../helper/apis'
  import { ACTION_TYPES, ASSETS_RISK_ARR, ASSETS_LIQUIDITY_ARR } from './../../helper/constant'
  import { alert } from './../../stores'
  import type { ModalOptions } from 'flowbite'

  const dispatch = createEventDispatcher()
  const MODAL_KEY = 'update-modal'
  let modal = null
  let datetimeError = ''
  let isUpdate = false

  export let action = ''
  export let items = {
    type: '',
    amount: 0,
    currency: '',
    datetime: '',
    note: '',
    risk: 'LOW',
    liquidity: 'GOOD',
  }

  $: isUpdate = action === ACTION_TYPES.update

  onMount(() => {
    const $targetEl = document.getElementById(MODAL_KEY)
    const options: ModalOptions = {
      placement: 'top-center',
      backdrop: 'static',
      closable: true,
      onHide: () => {
        dispatch('close')
      },
      onShow: () => {},
    }
    modal = new Modal($targetEl, options)
    modal.show()
  })

  onDestroy(() => {
    modal = null
  })

  const validateDatetimeInput = (params) => {
    const rawDateTime = dayjs(params.raw_data, 'YYYY-MM-DD')
    const nowDateTime = dayjs(params.datetime, 'YYYY-MM-DD')
    const isValidDate = nowDateTime.isValid()

    datetimeError = !isValidDate ? '您输入的时间格式不合法' : ''
    if (datetimeError) return

    const isEarlier = rawDateTime.isBefore(nowDateTime)
    datetimeError = isUpdate && isEarlier ? '' : '更新时间不能早于原始时间'
  }

  const genRiskActive = (risk) => {
    return risk === 'LOW' ? 0 : items.risk === 'MEDIUM' ? 1 : 2
  }

  const genLiquidityActive = (liquidity) => {
    return liquidity === 'GOOD' ? 0 : items.risk === 'MEDIUM' ? 1 : 2
  }

  /*----------------CallBackEvent----------------*/

  const closeModal = () => {
    modal.hide()
    modal = null
    dispatch('close')
  }

  const onConfirmClick = async () => {
    if (datetimeError) {
      alert.set(datetimeError)
      return
    }
    try {
      if (action === ACTION_TYPES.create) {
        await create(items)
      } else {
        await update(items)
      }
      dispatch('confirm', items)
      modal.hide()
      modal = null
    } catch (error) {
      console.error('Error updating wealth:', error)
    }
  }

  const onHandleRiskSelect = (event) => {
    items.risk = event.detail.value
  }

  const onHandleLiquiditySelect = (event) => {
    items.liquidity = event.detail.value
  }
</script>

<div
  id="update-modal"
  tabindex="-1"
  class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full">
  <div class="relative h-full w-full max-w-lg md:h-auto md:max-w-md">
    <!-- Modal content -->
    <div class="relative mt-16 rounded-lg bg-white pb-8 shadow">
      <!-- Modal header -->
      <div class="flex items-center justify-between rounded-t border-b p-5">
        <h3 class="flex items-center text-lg font-medium text-gray-900 md:text-base">
          <SvgIcon name="adjustment" width={30} height={30} color="#1e293b" />
          {isUpdate ? '更新财富' : '新增财富'}
        </h3>
        <button
          type="button"
          on:click={closeModal}
          class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
          <SvgIcon name="close" width={30} height={30} />
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="flex flex-col items-center justify-center p-6">
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-type" class="w-56 text-base font-bold md:pb-2 md:text-sm">类型</label>
          <input
            type="text"
            id="update-type"
            disabled={isUpdate}
            bind:value={items.type}
            class="custom-input"
            placeholder="请填写类型"
            required />
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-currency" class="w-56 text-base font-bold md:pb-2 md:text-sm">
            币种
          </label>
          <input
            type="text"
            id="update-currency"
            disabled={isUpdate}
            bind:value={items.currency}
            class="custom-input"
            placeholder="请填写币种"
            required />
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-currency" class="w-56 text-base font-bold md:pb-2 md:text-sm">
            风险
          </label>
          <div class="w-full">
            <CustomSelect
              options={ASSETS_RISK_ARR}
              active={genRiskActive(items.risk)}
              width="w-full"
              on:selected={onHandleRiskSelect} />
          </div>
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-currency" class="w-56 text-base font-bold md:pb-2 md:text-sm">
            流动性
          </label>
          <div class="w-full">
            <CustomSelect
              options={ASSETS_LIQUIDITY_ARR}
              active={genLiquidityActive(items.liquidity)}
              width="w-full"
              on:selected={onHandleLiquiditySelect} />
          </div>
        </div>
        <div class="inline-flex w-full items-center justify-center pb-4">
          <hr class="my-4 h-px w-full border-0 bg-gray-200" />
          <span class="text-gray absolute left-1/2 -translate-x-1/2 bg-white px-3 font-medium">
            以上为低频更新内容
          </span>
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-amount" class="w-56 text-base font-bold md:pb-2 md:text-sm">
            金额
          </label>
          <input
            type="number"
            step="0.01"
            id="update-amount"
            bind:value={items.amount}
            class="custom-input"
            placeholder="请填写金额"
            required />
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-datetime" class="w-56 text-base font-bold md:pb-2 md:text-sm">
            时间
          </label>
          <div class="w-full">
            <input
              type="text"
              id="update-datetime"
              bind:value={items.datetime}
              class="custom-input"
              placeholder="请填写时间"
              on:input={() => validateDatetimeInput(items)}
              required />
            {#if datetimeError}
              <p class="text-mark text-sm">{datetimeError}</p>
            {/if}
          </div>
        </div>
        <div
          class="flex w-full flex-row items-center justify-between pb-4 text-base md:flex-wrap md:text-sm">
          <label for="update-note" class="w-56 text-base font-bold md:pb-2 md:text-sm">备注</label>
          <input
            type="text"
            id="update-note"
            bind:value={items.note}
            class="custom-input"
            placeholder="请填写备注"
            required />
        </div>
      </div>
      <div class="flex items-center justify-center">
        <button type="button" on:click={onConfirmClick} class="regular-btn">确定</button>
      </div>
    </div>
  </div>
</div>
