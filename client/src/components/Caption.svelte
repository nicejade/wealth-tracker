<script>
  import { Heading } from 'flowbite-svelte'
  export let title = ''
  export let subtitle = ''
</script>

<div class="flex items-center justify-between">
  <div class="flex-shrink-0">
    <Heading tag="h3" class="text-2xl">{title}</Heading>
    {#if subtitle}
      <p class="text-base font-light text-gray">
        {subtitle}
      </p>
    {/if}
  </div>
  <slot />
</div>
