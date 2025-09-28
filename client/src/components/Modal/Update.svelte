<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
  import { _ } from 'svelte-i18n'
  import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
  import { Modal } from 'flowbite'
  import InputTag from '../InputTag.svelte'
  import SvgIcon from '../SvgIcon.svelte'
  import CustomSelect from './../Select.svelte'
  import { createAssets, updateAssets, updateRecords } from './../../helper/apis'
  import {
    ACTION_TYPES,
    ASSETS_RISK_ARR,
    ASSETS_LIQUIDITY_ARR,
    DEFAULT_ACCOUNT_ITEM,
    SUPPORTED_CURRENCIES,
  } from './../../helper/constant'
  import { alert, language } from './../../stores'
  import { deepClone } from './../../helper/utils'
  import type { ModalOptions } from 'flowbite'

  dayjs.extend(isSameOrBefore)

  const dispatch = createEventDispatcher()
  const MODAL_KEY = 'update-modal'
  let modal = null
  let datetimeError = ''
  let isUpdate = false
  let isChange = false
  let supportedCurrencys: Currencys[] = SUPPORTED_CURRENCIES

  export let action = ''
  export let items = deepClone(DEFAULT_ACCOUNT_ITEM)

  type Currencys = {
    name?: string
    value: string
  }

  $: if ($language) {
    supportedCurrencys = SUPPORTED_CURRENCIES.map((item) => ({
      name: $_(`currencys.${item.value}`) || '',
      value: item.value,
    }))
  }

  $: isUpdate = action === ACTION_TYPES.update

  $: isChange = action === ACTION_TYPES.update || action === ACTION_TYPES.change

  $: localizedRiskArr = ASSETS_RISK_ARR.map((item) => ({
    name: $_(item.key),
    value: item.value,
  }))

  $: localizedLiquidityArr = ASSETS_LIQUIDITY_ARR.map((item) => ({
    name: $_(item.key),
    value: item.value,
  }))

  // tags 本地绑定数组，解决 Svelte 只能绑定到标识符/成员表达式的问题
  let tags: string[] = []

  onMount(() => {
    // 初始化（若 items.tags 存在且为字符串）
    if (typeof items?.tags === 'string') {
      tags = items.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  })

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
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const isValidFormat = dateRegex.test(params.datetime)
    const nowDateTime = dayjs(items.datetime, 'YYYY-MM-DD')
    const isValidDate = nowDateTime.isValid()

    if (!isValidFormat || !isValidDate) {
      return (datetimeError = $_('fillValidDateTip'))
    }

    if (isUpdate) {
      const rawDateTime = dayjs(params.rawDatetime, 'YYYY-MM-DD')
      const isEarlier = rawDateTime.isSameOrBefore(nowDateTime, 'day')
      return (datetimeError = isEarlier ? '' : $_('fillLaterDateTip'))
    }
    datetimeError = ''
  }

  const genRiskActive = (risk) => {
    return ASSETS_RISK_ARR.findIndex((item) => item.value === risk)
  }

  const genLiquidityActive = (liquidity) => {
    return ASSETS_LIQUIDITY_ARR.findIndex((item) => item.value === liquidity)
  }

  const genCurrencyActive = (currency) => {
    return SUPPORTED_CURRENCIES.findIndex((item) => item.value === currency)
  }

  const sendUpdateRequest = async () => {
    try {
      // 提交前将本地 tags 同步回 items.tags（以逗号分隔字符串保存）
      if (Array.isArray(tags)) {
        items.tags = tags.join(',')
      }
      if (action === ACTION_TYPES.create) {
        await createAssets(items)
      }
      if (action === ACTION_TYPES.update) {
        await updateAssets(items)
      }
      if (action === ACTION_TYPES.change) {
        await updateRecords(items)
      }
      dispatch('confirm', items)
      modal.hide()
      modal = null
    } catch (error) {
      console.error('Error updating assets:', error)
    }
  }

  /*----------------CallBackEvent----------------*/

  const closeModal = () => {
    modal.hide()
    modal = null
    dispatch('close')
  }

  const onConfirmClick = () => {
    if (!items.alias || !items.alias.trim()) {
      alert.set($_('fillAccountTypeTip'))
      return
    }
    validateDatetimeInput(items)
    if (datetimeError) {
      alert.set(datetimeError)
      return
    }
    sendUpdateRequest()
  }

  const handleRiskSelect = (event) => {
    items.risk = event.detail.value
  }

  const handleCurrencySelect = (event) => {
    items.currency = event.detail.value
  }

  const handleLiquiditySelect = (event) => {
    items.liquidity = event.detail.value
  }
</script>

<div
  id="update-modal"
  tabindex="-1"
  class="z-9999 fixed left-0 right-0 top-0 hidden h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full">
  <div class="relative h-full w-full max-w-lg md:h-auto md:max-w-md">
    <!-- Modal content -->
    <div class="relative mt-16 rounded-lg bg-white pb-8 shadow">
      <!-- Modal header -->
      <div class="flex items-center justify-between rounded-t border-b p-5">
        <h3 class="flex items-center text-lg font-medium text-gray-900 md:text-base">
          <SvgIcon name="adjustment" width={20} height={20} color="#1e293b" />
          {isChange ? $_('updateAssetRecords') : $_('newAssetAccount')}
        </h3>
        <button
          type="button"
          on:click={closeModal}
          class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
          <SvgIcon name="close" width={20} height={20} />
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="flex flex-col items-center justify-center p-6">
        <div class="module-warp">
          <label for="update-alias" class="custom-label">
            {$_('account')}
            <i class="text-mark">*</i>
          </label>
          <input
            type="text"
            id="update-alias"
            bind:value={items.alias}
            class="custom-input"
            placeholder={$_('placeholderOfAlias')}
            required />
        </div>
        <div class="module-warp">
          <label for="update-currency" class="custom-label">
            {$_('currency')}
          </label>
          <div class="w-full">
            <CustomSelect
              options={supportedCurrencys}
              active={genCurrencyActive(items.currency)}
              listboxClass="w-full"
              on:selected={handleCurrencySelect} />
          </div>
        </div>
        <div class="module-warp">
          <label for="update-currency" class="custom-label">
            {$_('risk')}
          </label>
          <div class="w-full">
            <CustomSelect
              options={localizedRiskArr}
              active={genRiskActive(items.risk)}
              listboxClass="w-full"
              on:selected={handleRiskSelect} />
          </div>
        </div>
        <div class="module-warp">
          <label for="update-currency" class="custom-label">
            {$_('liquidity')}
          </label>
          <div class="w-full">
            <CustomSelect
              options={localizedLiquidityArr}
              active={genLiquidityActive(items.liquidity)}
              listboxClass="w-full"
              on:selected={handleLiquiditySelect} />
          </div>
        </div>
        <div class="module-warp">
          <label for="update-tags" class="custom-label">
            {$_('tags')}
          </label>
          <InputTag
            bind:modelValue={tags}
            placeholder={$_('placeholderOfTags')}
            max={3}
            delimiter={','}
            id="update-tags"
            tabindex="0"
            maxlength="50"
            minlength="0"
            ariaLabel="tags" />
        </div>

        <div class="inline-flex w-full items-center justify-center pb-4">
          <hr class="my-6 h-px w-full border-0 bg-gray-200" />
          <span
            class="text-grey absolute left-1/2 -translate-x-1/2 bg-white px-3 text-center font-medium leading-5">
            {$_('lowFrequencyTip')}
          </span>
        </div>

        <div class="module-warp">
          <label for="update-amount" class="custom-label">
            {$_('amount')}
          </label>
          <input
            type="number"
            step="0.01"
            id="update-amount"
            bind:value={items.amount}
            class="custom-input"
            placeholder={$_('placeholderOfAmount')}
            required />
        </div>
        <div class="module-warp">
          <label for="update-datetime" class="custom-label">
            {$_('datetime')}
          </label>
          <div class="w-full">
            <input
              type="text"
              id="update-datetime"
              bind:value={items.datetime}
              class="custom-input"
              placeholder={$_('placeholderOfDate')}
              on:input={() => validateDatetimeInput(items)}
              required />
            {#if datetimeError}
              <p class="text-mark text-sm">{datetimeError}</p>
            {/if}
          </div>
        </div>
        <div class="module-warp">
          <label for="update-note" class="custom-label">
            {$_('remark')}
          </label>
          <input
            type="text"
            id="update-note"
            bind:value={items.note}
            class="custom-input"
            placeholder={$_('placeholderOfRemark')}
            required />
        </div>
      </div>
      <div class="flex items-center justify-center">
        <button type="button" on:click={onConfirmClick} class="regular-btn">{$_('confirm')}</button>
      </div>
    </div>
  </div>
</div>
