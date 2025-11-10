<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Toggle } from 'flowbite-svelte'
  import { Modal } from 'flowbite'
  import { _ } from 'svelte-i18n'
  import SvgIcon from '../SvgIcon.svelte'
  import { EXCHANGE_RATE_API_KEY, BITCOIN_API_KEY } from './../../helper/constant'
  import { fetchExchangeRates } from './../../helper/utils'
  import { hashPassword } from './../../helper/auth'
  import { setPassword } from './../../helper/apis'
  import { loadUserSettings, saveUserSettings } from './../../helper/settings'
  import { alert, isPasswordAllowed, isResettable } from './../../stores'
  import type { ModalOptions } from 'flowbite'

  const dispatch = createEventDispatcher()
  let modal: any = null
  const MODAL_KEY: string = 'setting-modal'
  let loading: boolean = false
  let error: string = ''
  let rateApiKey: string = ''
  let bitcoinApiKey: string = ''
  let password: string = ''
  let confirmPassword: string = ''

  $: if (error) {
    alert.set(error)
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

  onMount(async () => {
    // 从服务器加载 API keys
    try {
      const settings = await loadUserSettings()
      rateApiKey = settings.exchangeRateApiKey || ''
      bitcoinApiKey = settings.bitcoinApiKey || ''
    } catch (error) {
      console.error('Failed to load settings:', error)
      // 如果加载失败，从 localStorage 读取（向后兼容）
      rateApiKey = localStorage.getItem(EXCHANGE_RATE_API_KEY) || ''
      bitcoinApiKey = localStorage.getItem(BITCOIN_API_KEY) || ''
    }

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
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          error = $_('passwordsDoNotMatch')
          return
        }
        if (password.length < 6) {
          error = $_('passwordTooShort')
          return
        }
      }
      loading = true
      error = ''

      // 保存 API keys 到服务器
      await saveUserSettings({
        exchangeRateApiKey: rateApiKey,
        bitcoinApiKey: bitcoinApiKey,
      })

      if (password) {
        const hashedPassword = await hashPassword(password)
        await setPassword(hashedPassword)
      }
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
    <!-- Modal content -->
    <div class="relative mt-8 rounded-lg bg-white pb-8 shadow">
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
          <label for="rateApiKey" class="custom-label !leading-5">
            <a
              target="_blank"
              class="text-link hover:text-mark leading-3"
              href="https://fine.niceshare.site/projects/wealth-tracker/#如何获取汇率-api-key">
              Exchange Rate <br />
              API Key
            </a>
          </label>
          <input
            type="text"
            class="custom-input"
            required
            bind:value={rateApiKey}
            placeholder={$_('validRateApiTip')} />
        </div>

        <div class="module-warp">
          <label for="bitcoinApiKey" class="custom-label !leading-5">
            <a
              target="_blank"
              class="text-link hover:text-mark leading-3"
              href="https://api-ninjas.com/api/bitcoin">
              Bitcoin <br />
              API Key
            </a>
          </label>
          <input
            type="text"
            class="custom-input"
            bind:value={bitcoinApiKey}
            placeholder={$_('validBitcoinApiTip')} />
        </div>

        <hr class="my-6 h-px w-full border-0 bg-gray-200" />

        <div class="module-warp">
          <label for="allowReset" class="custom-label">
            {$_('allowReset')}
          </label>
          <Toggle id="allowReset" disabled checked={$isResettable} />
        </div>

        <div class="module-warp">
          <label for="allowPassword" class="custom-label">
            {$_('allowPassword')}
          </label>
          <Toggle id="allowPassword" disabled checked={$isPasswordAllowed} />
        </div>

        {#if $isPasswordAllowed}
          <div class="inline-flex w-full items-center justify-center pb-4">
            <hr class="my-6 h-px w-full border-0 bg-gray-200" />
            <span
              class="text-warn absolute left-1/2 -translate-x-1/2 bg-white px-3 text-center font-medium leading-5">
              {$_('setPasswordTip')}
            </span>
          </div>

          <div class="module-warp">
            <label for="passwordInput" class="custom-label">
              {$_('setPassword')}
            </label>
            <input
              id="passwordInput"
              type="password"
              class="custom-input"
              bind:value={password}
              placeholder={$_('passwordTip')} />
          </div>

          <div class="module-warp">
            <label for="confirmPasswordInput" class="custom-label">
              {$_('confirmPassword')}
            </label>
            <input
              id="confirmPasswordInput"
              type="password"
              class="custom-input"
              bind:value={confirmPassword}
              placeholder={$_('confirmPasswordTip')} />
          </div>
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
