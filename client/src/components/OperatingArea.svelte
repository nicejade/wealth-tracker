<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import CustomSelect from './Select.svelte'
  import SettingModal from './Modal/Setting.svelte'
  import { language, targetCurrencyCode, targetCurrencyName } from './../stores'
  import { getStoredCurrency, setStoredCurrency } from './../helper/utils'
  import { saveUserSettings } from './../helper/settings'
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
  let isSticky: boolean = false
  let operatingArea: HTMLElement

  $: if ($language) {
    supportedCurrencys = SUPPORTED_CURRENCIES.map((item) => ({
      name: $_(`currencys.${item.value}`) || '',
      value: item.value,
    }))
  }

  onMount(() => {
    targetCurrencyCode.set(getStoredCurrency())

    // Setup scroll listener for sticky behavior
    let originalTop = 0

    const handleScroll = () => {
      if (operatingArea) {
        // Get the original position of the component on first load
        if (originalTop === 0 && window.scrollY === 0) {
          originalTop = operatingArea.offsetTop
        }

        // Only enable sticky behavior on screens larger than 768px
        const isLargeScreen = window.innerWidth > 768

        if (isLargeScreen) {
          // Component becomes sticky when it reaches the top
          // and returns to normal when scrolled back to its original position
          const shouldBeSticky = window.scrollY >= originalTop
          isSticky = shouldBeSticky
        } else {
          // On mobile/small screens, always keep normal state
          isSticky = false
        }
      }
    }

    // Initial check
    setTimeout(() => {
      if (operatingArea) {
        originalTop = operatingArea.offsetTop
      }
    }, 100)

    // Handle window resize to update sticky behavior
    const handleResize = () => {
      const isLargeScreen = window.innerWidth > 768
      if (!isLargeScreen) {
        isSticky = false
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  })

  const handleCurrencySelect = async (event) => {
    targetCurrencyCode.set(event.detail.value)
    targetCurrencyName.set(event.detail.name)
    setStoredCurrency(event.detail.value)
    await saveUserSettings({ targetCurrency: event.detail.value }).catch((err) => {
      console.error('Failed to save currency:', err)
    })
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
  bind:this={operatingArea}
  class="operating-area flex h-16 w-full flex-row items-center justify-between rounded-full border border-gray-300 px-6 shadow-sm md:h-36 md:flex-col md:items-start md:justify-around md:rounded-md"
  class:sticky={isSticky}>
  <div class="flex items-center space-x-4 md:w-full md:justify-between md:space-x-0">
    <button
      class="operating-btn focus-visible-ring"
      on:click={() => {
        onAddClick()
      }}>
      <SvgIcon name="dollar" />
      <strong class="operating-text">{$_('addition')}</strong>
    </button>
    <a
      href="/insights"
      class="hover:text-brand focus-visible-ring space-x-2 rounded-full border border-gray-300 px-4 py-2 text-black hover:bg-gray-100">
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
      class="operating-btn focus-visible-ring"
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

<style>
  .operating-area {
    /* Glassmorphism effect */
    z-index: 10;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      background-color 0.3s ease,
      backdrop-filter 0.3s ease,
      -webkit-backdrop-filter 0.3s ease,
      border 0.3s ease,
      box-shadow 0.3s ease;
  }

  .operating-area.sticky {
    z-index: 100;
    position: fixed;
    top: 10px;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
    width: calc(100% - 2rem);
    max-width: 896px;
    margin: 0 auto;
  }

  /* Enhanced glassmorphism on hover */
  .operating-area:hover {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .operating-area.sticky:hover {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  /* Ensure sticky behavior only works on screens larger than 768px */
  @media (max-width: 768px) {
    .operating-area.sticky {
      position: relative;
      top: auto;
      left: auto;
      transform: none;
      z-index: auto;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: none;
      width: auto;
      max-width: none;
      margin: 0;
    }
  }
</style>
