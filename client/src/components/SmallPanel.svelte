<script lang="ts">
  import Change from './Change.svelte'

  export let title: string
  export let subtitle: string = ''
  export let change: number = 0
</script>

<div class="mt-4 flex min-w-[120px] flex-col text-center text-base">
  <slot name="icon" />
  <p class="text-[0.8125rem] font-medium tracking-wide text-ink-tertiary">{title}</p>
  <strong class="text-blue text-lg font-semibold tracking-tight">{subtitle}</strong>

  {#if change}
    <Change value={change} size="sm" equalHeight />
  {/if}
</div>
