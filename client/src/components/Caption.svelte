<script>
  import { Heading } from 'flowbite-svelte'
  export let title = ''
  export let subtitle = ''
</script>

<div
  class="flex w-full items-center justify-between md:flex-col md:items-start md:justify-start md:space-y-1.5">
  <div class="flex flex-col gap-1">
    <Heading tag="h2" class="caption-title !text-xl !font-semibold !tracking-tight !text-ink-primary"
      >{title}</Heading>
    {#if subtitle}
      <p class="caption-sub w-full max-w-[42rem] text-sm font-normal leading-relaxed text-ink-secondary">
        {subtitle}
      </p>
    {/if}
  </div>
  <slot />
</div>

<style>
  :global(.caption-title) {
    text-wrap: balance;
    color: var(--color-ink) !important;
  }
  .caption-sub {
    text-wrap: pretty;
    color: var(--color-ink-secondary);
  }
</style>
