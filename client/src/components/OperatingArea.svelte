<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import CustomSelect from './Select.svelte'
  import SettingModal from './Modal/Setting.svelte'
  import { language, targetCurrencyCode, targetCurrencyName } from './../stores'
  import { getStoredCurrency, setStoredCurrency } from './../helper/utils'
  import { SUPPORTED_CURRENCIES } from './../helper/constant'

  type Currencys = {
    name?: string
    value: string
  }

  const dispatch = createEventDispatcher()
  let isShowSetting: boolean = false
  let currencyActive: number = SUPPORTED_CURRENCIES.findIndex(
    (currency) => currency.value === getStoredCurrency(),
  )
  let supportedCurrencys: Currencys[] = SUPPORTED_CURRENCIES

  $: if ($language) {
    supportedCurrencys = SUPPORTED_CURRENCIES.map((item) => ({
      name: $_(`currencys.${item.value}`) || '',
      value: item.value,
    }))
  }

  onMount(() => {
    targetCurrencyCode.set(getStoredCurrency())
  })

  const handleCurrencySelect = (event) => {
    targetCurrencyCode.set(event.detail.value)
    targetCurrencyName.set(event.detail.name)
    setStoredCurrency(event.detail.value)
  }

  const onAddClick = () => {
    dispatch('add')
  }

  const onSettingClick = () => {
    isShowSetting = true
  }

  const handleSettingClose = () => {
    isShowSetting = false
  }
</script>

<div
  class="flex h-16 w-full flex-row items-center justify-between rounded-full border border-gray-300 px-6 shadow-sm md:h-36 md:flex-col md:items-start md:justify-around md:rounded-md">
  <div class="flex items-center space-x-4 md:w-full md:justify-between md:space-x-0">
    <button
      class="operating-btn"
      on:click={() => {
        onAddClick()
      }}>
      <SvgIcon name="dollar" />
      <strong class="operating-text">{$_('addition')}</strong>
    </button>
    <a
      href="/insights"
      class="hover:text-brand space-x-2 rounded-full border border-gray-300 px-4 py-2 text-black hover:bg-gray-100 focus:ring-0">
      <SvgIcon name="edit" />
      <strong class="operating-text">{$_('insightsNav')}</strong>
    </a>
  </div>
  <div class="flex items-center space-x-4 md:w-full md:justify-between md:space-x-0">
    <CustomSelect
      label={$_('currency')}
      options={supportedCurrencys}
      active={currencyActive}
      listboxClass="w-36"
      on:selected={handleCurrencySelect} />
    <button
      class="operating-btn"
      on:click={() => {
        onSettingClick()
      }}>
      <SvgIcon name="setting" />
      <strong class="operating-text">{$_('setting')}</strong>
    </button>
  </div>
</div>

{#if isShowSetting}
  <SettingModal on:close={handleSettingClose} />
{/if}
