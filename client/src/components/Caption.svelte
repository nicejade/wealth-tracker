<script>
  import { Heading } from 'flowbite-svelte'
  export let title = ''
  export let subtitle = ''
</script>

<div
  class="flex items-center justify-between md:flex-col md:items-start md:justify-start md:space-y-2">
  <div class="flex-shrink-0">
    <Heading tag="h2" class="text-xl">{title}</Heading>
    {#if subtitle}
      <p class="text-grey text-base font-light">
        {subtitle}
      </p>
    {/if}
  </div>
  <slot />
</div>
