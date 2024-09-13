<script>
  import { Heading } from 'flowbite-svelte'
  export let title = ''
  export let subtitle = ''
</script>

<div
  class="flex items-center justify-between md:flex-col md:items-start md:justify-start md:space-y-2">
  <div class="flex-shrink-0">
    <Heading tag="h3" class="text-2xl">{title}</Heading>
    {#if subtitle}
      <p class="text-gray text-base font-light">
        {subtitle}
      </p>
    {/if}
  </div>
  <slot />
</div>
