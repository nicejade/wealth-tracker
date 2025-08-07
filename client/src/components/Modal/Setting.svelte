<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Modal } from 'flowbite'
  import { _ } from 'svelte-i18n'
  import SvgIcon from '../SvgIcon.svelte'
  import { EXCHANGE_RATE_API_KEY, BITCOIN_API_KEY } from './../../helper/constant'
  import { fetchExchangeRates } from './../../helper/utils'
  import type { ModalOptions } from 'flowbite'

  const dispatch = createEventDispatcher()
  const MODAL_KEY = 'setting-modal'
  let modal = null
  let loading = false
  let error = ''
  let rateApiKey = localStorage.getItem(EXCHANGE_RATE_API_KEY) || ''
  let bitcoinApiKey = localStorage.getItem(BITCOIN_API_KEY) || ''

  $: {
    const isValidRate = !rateApiKey || isValidRateApiKey(rateApiKey)
    const isValidBitcoin = !bitcoinApiKey || isValidBitcoinApiKey(bitcoinApiKey)
    if (!isValidRate) {
      error = $_('validRateApiTip')
    } else if (!isValidBitcoin) {
      error = $_('validBitcoinApiTip')
    } else {
      error = ''
    }
  }

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

  const closeModal = () => {
    modal.hide()
    modal = null
    dispatch('close')
  }

  onDestroy(() => {
    modal = null
  })

  const onCloseModal = () => {
    closeModal()
  }

  const isValidRateApiKey = (key: string): boolean => {
    const API_KEY_PATTERN = /^[A-Za-z0-9]{24}$/
    return API_KEY_PATTERN.test(key)
  }

  const isValidBitcoinApiKey = (key: string): boolean => {
    const API_KEY_PATTERN = /^[A-Za-z0-9/+_=]{40}$/
    return API_KEY_PATTERN.test(key)
  }

  const handleConfirm = async () => {
    try {
      if (rateApiKey && !isValidRateApiKey(rateApiKey)) {
        error = $_('validRateApiTip')
        return
      }
      if (bitcoinApiKey && !isValidBitcoinApiKey(bitcoinApiKey)) {
        error = $_('validBitcoinApiTip')
        return
      }
      loading = true
      error = ''
      localStorage.setItem(EXCHANGE_RATE_API_KEY, rateApiKey)
      localStorage.setItem(BITCOIN_API_KEY, bitcoinApiKey)
      await fetchExchangeRates()
      closeModal()
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  }
</script>

<div
  id={MODAL_KEY}
  tabindex="-1"
  class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full">
  <div class="relative h-full w-full max-w-lg md:h-auto md:max-w-md">
    <div class="relative mt-16 rounded-lg bg-white pb-8 shadow">
      <!-- Modal header -->
      <div class="flex items-center justify-between rounded-t border-b p-5">
        <h3 class="flex items-center text-lg font-medium text-gray-900 md:text-base">
          <SvgIcon name="setting" width={20} height={20} color="#1e293b" />
          {$_('setting')}
        </h3>
        <button
          type="button"
          on:click={onCloseModal}
          class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900">
          <SvgIcon name="close" width={20} height={20} />
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="flex flex-col items-center justify-center p-6">
        <div class="module-warp">
          <label for="rateApiKey" class="custom-label">
            <a
              target="_blank"
              class="text-brand hover:text-mark leading-3"
              href="https://fine.niceshare.site/projects/wealth-tracker/#如何获取汇率-api-key">
              Exchange Rate <br />
              API Key
            </a>
            <i class="text-mark">*</i>
          </label>
          <input
            type="text"
            class="custom-input"
            required
            bind:value={rateApiKey}
            placeholder={$_('validRateApiTip')} />
        </div>

        <div class="module-warp mt-4">
          <label for="bitcoinApiKey" class="custom-label">
            <a
              target="_blank"
              class="text-brand hover:text-mark leading-3"
              href="https://api-ninjas.com/api/bitcoin">
              Bitcoin <br />
              API Key
              <i class="text-mark">*</i>
            </a>
          </label>
          <input
            type="text"
            class="custom-input"
            bind:value={bitcoinApiKey}
            placeholder={$_('validBitcoinApiTip')} />
        </div>

        {#if error}
          <p class="text-sm text-red-500">{error}</p>
        {/if}
      </div>
      <div class="flex items-center justify-center">
        <button type="button" on:click={handleConfirm} class="regular-btn" disabled={loading}>
          {$_('confirm')}
        </button>
      </div>
    </div>
  </div>
</div>
