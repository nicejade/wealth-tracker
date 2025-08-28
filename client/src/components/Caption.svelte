<script>
  import { Heading } from 'flowbite-svelte'
  export let title = ''
  export let subtitle = ''
</script>

<div
  class="flex w-full items-center justify-between md:flex-col md:items-start md:justify-start md:space-y-2">
  <div class="flex flex-col">
    <Heading tag="h2" class="text-xl">{title}</Heading>
    {#if subtitle}
      <p class="text-grey w-full text-base font-light">
        {subtitle}
      </p>
    {/if}
  </div>
  <slot />
</div>
