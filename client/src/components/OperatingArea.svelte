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
  let spacerHeight: number = 0
  let originalTop = 0

  $: if ($language) {
    supportedCurrencys = SUPPORTED_CURRENCIES.map((item) => ({
      name: $_(`currencys.${item.value}`) || '',
      value: item.value,
    }))
  }

  onMount(() => {
    targetCurrencyCode.set(getStoredCurrency())

    const measure = () => {
      if (!operatingArea) return
      // Measure natural position only when not sticky (offsetTop is reliable in flow)
      if (!isSticky) {
        originalTop = operatingArea.offsetTop
        spacerHeight = operatingArea.offsetHeight
      }
    }

    const handleScroll = () => {
      if (!operatingArea) return

      const isLargeScreen = window.innerWidth > 768
      if (!isLargeScreen) {
        if (isSticky) isSticky = false
        return
      }

      if (!isSticky && originalTop === 0) {
        originalTop = operatingArea.offsetTop
        spacerHeight = operatingArea.offsetHeight
      }

      const shouldBeSticky = window.scrollY >= originalTop
      if (shouldBeSticky !== isSticky) {
        if (shouldBeSticky) {
          spacerHeight = operatingArea.offsetHeight
        }
        // Instant toggle — no transform / layout animation
        isSticky = shouldBeSticky
      }
    }

    const handleResize = () => {
      const isLargeScreen = window.innerWidth > 768
      if (!isLargeScreen) {
        isSticky = false
        return
      }
      // Recalculate anchor after layout changes
      if (!isSticky && operatingArea) {
        originalTop = operatingArea.offsetTop
        spacerHeight = operatingArea.offsetHeight
      }
    }

    setTimeout(measure, 100)

    window.addEventListener('scroll', handleScroll, { passive: true })
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

{#if isSticky}
  <div class="operating-area-spacer" style="height: {spacerHeight}px" aria-hidden="true"></div>
{/if}

<div
  bind:this={operatingArea}
  class="operating-area liquid-glass flex h-[4.25rem] w-full flex-row items-center justify-between overflow-visible rounded-full px-5 md:h-36 md:flex-col md:items-start md:justify-around md:rounded-[1.375rem] md:px-4"
  class:sticky={isSticky}>
  <div class="flex items-center space-x-2 md:w-full md:justify-between md:space-x-0">
    <button
      class="operating-btn focus-visible-ring"
      on:click={() => {
        onAddClick()
      }}>
      <SvgIcon name="dollar" />
      <strong class="operating-text">{$_('addition')}</strong>
    </button>
    <a href="/insights" class="nav-chip focus-visible-ring">
      <SvgIcon name="edit" />
      <strong class="operating-text">{$_('insightsNav')}</strong>
    </a>
    <a href="/report" class="nav-chip focus-visible-ring">
      <SvgIcon name="align" />
      <strong class="operating-text">{$_('report.nav')}</strong>
    </a>
  </div>
  <div
    class="operating-area-end relative z-20 flex shrink-0 items-center gap-3 overflow-visible md:w-full md:justify-between">
    <CustomSelect
      label={$_('currency')}
      options={supportedCurrencys}
      active={currencyActive}
      listboxClass="w-36"
      on:selected={handleCurrencySelect} />
    <button
      type="button"
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
  .operating-area-spacer {
    width: 100%;
    pointer-events: none;
    visibility: hidden;
  }

  .operating-area {
    z-index: 10;
    overflow: visible;
    /* No transform/position transitions — sticky must snap, not slide */
  }

  .operating-area.sticky {
    /* Below modals (1000+) so dialogs are never covered by the sticky bar */
    z-index: 40;
    position: fixed;
    top: 12px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    /* Match #main.app-shell content width tokens */
    max-width: var(--app-shell-max, 52rem);
    margin: 0;
    overflow: visible;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -1px 0 rgba(255, 255, 255, 0.08),
      0 16px 48px rgba(15, 23, 42, 0.1);
  }

  @media (min-width: 1560px) {
    .operating-area.sticky {
      max-width: var(--app-shell-max-wide, 60rem);
    }
  }

  @media (max-width: 768px) {
    .operating-area.sticky {
      position: relative;
      top: auto;
      left: auto;
      transform: none;
      z-index: auto;
      width: auto;
      max-width: none;
      margin: 0;
      box-shadow: var(--glass-shadow);
    }
  }
</style>
