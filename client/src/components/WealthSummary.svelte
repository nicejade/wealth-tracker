<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { getCurrencySymbol } from './../helper/utils'
  import {
    customCurrencies,
    netWorthValue,
    targetCurrencyCode,
    totalAssetValue,
    totalLiabilityValue,
  } from './../stores'

  $: currencySymbol = getCurrencySymbol($targetCurrencyCode, $customCurrencies)
</script>

<div class="grid w-full grid-cols-3 gap-3.5 md:grid-cols-1 md:gap-3">
  <div class="metric-shell">
    <p class="metric-label">{$_('totalAssets')}</p>
    <strong class="metric-value text-blue">
      {currencySymbol}{$totalAssetValue}
    </strong>
  </div>
  <div class="metric-shell">
    <p class="metric-label">{$_('totalLiabilities')}</p>
    <strong class="metric-value {$totalLiabilityValue > 0 ? 'text-mark' : 'text-blue'}">
      {currencySymbol}{$totalLiabilityValue}
    </strong>
  </div>
  <div class="metric-shell-accent">
    <p class="metric-label" style="color: var(--color-ink-secondary)">{$_('netWorth')}</p>
    <strong class="metric-value text-brand">
      {currencySymbol}{$netWorthValue}
    </strong>
  </div>
</div>
