<script lang="ts">
  import Change from './Change.svelte'

  export let title: string
  export let subtitle: string = ''
  export let change: number = 0
</script>

<div class="min-w-[120px] text-center mt-4 flex flex-col text-base">
  <slot name="icon" />
  <p class="text-black font-light">{title}</p>
  <strong class="text-blue font-extrabold">{subtitle}</strong>

  {#if change}
    <Change value={change} size="sm" equalHeight />
  {/if}
</div>
