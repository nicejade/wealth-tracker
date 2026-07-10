<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
  import { Modal } from 'flowbite'
  import { _ } from 'svelte-i18n'
  import SvgIcon from '../SvgIcon.svelte'
  import CustomCurrencyManager from '../CustomCurrencyManager.svelte'
  import { EXCHANGE_RATE_API_KEY, BITCOIN_API_KEY } from './../../helper/constant'
  import { fetchExchangeRates } from './../../helper/utils'
  import { hashPassword } from './../../helper/auth'
  import { setPassword, exportBackup, importBackup } from './../../helper/apis'
  import { loadUserSettings, saveUserSettings } from './../../helper/settings'
  import { alert, notice, isPasswordAllowed, isResettable } from './../../stores'
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
  let activeTab: string = 'general'
  let isExporting: boolean = false
  let isImporting: boolean = false
  let importFileInput: HTMLInputElement

  const setTab = (tab: string) => {
    activeTab = tab
  }

  const dataActionBtnClass = 'regular-btn focus-visible-ring h-10 !min-w-fit !px-4 !py-0 !text-sm'

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = async () => {
    try {
      isExporting = true
      const backup = await exportBackup()
      downloadFile(
        JSON.stringify(backup, null, 2),
        `wealth-tracker-backup-${dayjs().format('YYYY-MM-DD')}.json`,
        'application/json',
      )
      notice.set($_('backup.exportSuccess'))
    } catch (err) {
      alert.set(err.message || $_('backup.exportFailed'))
    } finally {
      isExporting = false
    }
  }

  const escapeCsvCell = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value)
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const handleExportCsv = async () => {
    try {
      isExporting = true
      const backup: any = await exportBackup()
      const records = backup?.data?.records || []
      const columns = [
        'type',
        'alias',
        'amount',
        'currency',
        'risk',
        'liquidity',
        'tags',
        'datetime',
        'note',
        'created',
      ]
      const lines = [
        columns.join(','),
        ...records.map((item) => columns.map((key) => escapeCsvCell(item[key])).join(',')),
      ]
      // BOM keeps non-ASCII content readable when the CSV is opened in Excel.
      downloadFile(
        '\ufeff' + lines.join('\n'),
        `wealth-tracker-records-${dayjs().format('YYYY-MM-DD')}.csv`,
        'text/csv;charset=utf-8',
      )
      notice.set($_('backup.exportSuccess'))
    } catch (err) {
      alert.set(err.message || $_('backup.exportFailed'))
    } finally {
      isExporting = false
    }
  }

  const handleImportClick = () => {
    importFileInput?.click()
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      isImporting = true
      const text = await file.text()
      let payload
      try {
        payload = JSON.parse(text)
      } catch {
        alert.set($_('backup.importInvalid'))
        return
      }
      const result: any = await importBackup(payload)
      const counts = result?.counts || {}
      notice.set(
        $_('backup.importSuccess', {
          values: {
            assets: counts.assets || 0,
            records: counts.records || 0,
            insights: counts.insights || 0,
            goals: counts.goals || 0,
          },
        }),
      )
      // Reload so every widget reflects the merged dataset.
      setTimeout(() => window.location.reload(), 1600)
    } catch (err) {
      alert.set(err.message || $_('backup.importInvalid'))
    } finally {
      isImporting = false
      event.target.value = ''
    }
  }

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
      backdropClasses: 'fixed inset-0 z-40',
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
  <div class="relative h-full w-full max-w-2xl md:h-auto md:max-w-3xl">
    <!-- Modal content -->
    <div class="relative mt-8 rounded-lg bg-white pb-4 shadow">
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
      <div class="p-6">
        <!-- Tabs Navigation -->
        <div class="mb-4 border-b border-gray-200">
          <ul class="-mb-px flex flex-wrap text-center text-base font-medium">
            <li class="me-2">
              <button
                type="button"
                on:click={() => setTab('general')}
                class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'general'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}"
                role="tab">
                {$_('settingTabs.general')}
              </button>
            </li>
            <li class="me-2">
              <button
                type="button"
                on:click={() => setTab('currencies')}
                class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'currencies'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}"
                role="tab">
                {$_('settingTabs.currencies')}
              </button>
            </li>
            <li class="me-2">
              <button
                type="button"
                on:click={() => setTab('data')}
                class="inline-block rounded-t-lg border-b-2 p-4 {activeTab === 'data'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}"
                role="tab">
                {$_('settingTabs.data')}
              </button>
            </li>
          </ul>
        </div>

        <!-- Tab Content -->
        {#if activeTab === 'general'}
          <div class="flex flex-col items-center justify-center">
            <div class="module-warp">
              <label for="rateApiKey" class="custom-label !leading-5">
                <a
                  target="_blank"
                  class="text-link hover:text-mark leading-3"
                  href="https://fine.niceshare.site/projects/wealth-tracker/#如何获取汇率-api-key">
                  {$_('settingFields.exchangeRateApiKeyLabel')}
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
                  {$_('settingFields.bitcoinApiKeyLabel')}
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
              <button
                id="allowReset"
                type="button"
                role="switch"
                aria-checked={$isResettable}
                aria-label={$_('allowReset')}
                disabled
                class="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full transition-colors {$isResettable
                  ? 'bg-brand'
                  : 'bg-gray-300'}">
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform {$isResettable
                    ? 'translate-x-5'
                    : 'translate-x-0.5'}" />
              </button>
            </div>

            <div class="module-warp">
              <label for="allowPassword" class="custom-label">
                {$_('allowPassword')}
              </label>
              <button
                id="allowPassword"
                type="button"
                role="switch"
                aria-checked={$isPasswordAllowed}
                aria-label={$_('allowPassword')}
                disabled
                class="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full transition-colors {$isPasswordAllowed
                  ? 'bg-brand'
                  : 'bg-gray-300'}">
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform {$isPasswordAllowed
                    ? 'translate-x-5'
                    : 'translate-x-0.5'}" />
              </button>
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
          <div class="mt-4 flex items-center justify-center">
            <button type="button" on:click={handleConfirm} class="regular-btn" disabled={loading}>
              {$_('confirm')}
            </button>
          </div>
        {:else if activeTab === 'currencies'}
          <CustomCurrencyManager />
        {:else if activeTab === 'data'}
          <div class="flex flex-col space-y-6">
            <div>
              <h4 class="mb-1 text-base font-medium text-gray-900">
                {$_('backup.exportTitle')}
              </h4>
              <p class="text-grey mb-4 text-sm">{$_('backup.exportDesc')}</p>
              <div class="flex flex-wrap gap-4">
                <button
                  type="button"
                  class={dataActionBtnClass}
                  disabled={isExporting}
                  on:click={handleExportJson}>
                  {$_('backup.exportJson')}
                </button>
                <button
                  type="button"
                  class={dataActionBtnClass}
                  disabled={isExporting}
                  on:click={handleExportCsv}>
                  {$_('backup.exportCsv')}
                </button>
              </div>
            </div>

            <hr class="h-px w-full border-0 bg-gray-200" />

            <div>
              <h4 class="mb-1 text-base font-medium text-gray-900">
                {$_('backup.importTitle')}
              </h4>
              <p class="text-warn mb-4 text-sm">{$_('backup.importTip')}</p>
              <button
                type="button"
                class={dataActionBtnClass}
                disabled={isImporting}
                on:click={handleImportClick}>
                {isImporting ? $_('backup.importing') : $_('backup.importData')}
              </button>
              <input
                type="file"
                accept=".json,application/json"
                class="hidden"
                bind:this={importFileInput}
                on:change={handleImportFile} />
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
