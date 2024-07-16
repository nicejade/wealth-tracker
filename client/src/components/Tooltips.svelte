<script lang="ts">
  import { onMount } from 'svelte'

  export let placement = 'bottom'
  export let theme = 'default'

  let showTooltip = false

  let triggerElement

  onMount(() => {
    if (triggerElement) {
      triggerElement.addEventListener('mouseenter', handleMouseEnter)
      triggerElement.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (triggerElement) {
        triggerElement.removeEventListener('mouseenter', handleMouseEnter)
        triggerElement.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  })

  const handleMouseEnter = () => {
    showTooltip = true
  }

  const handleMouseLeave = () => {
    showTooltip = false
  }
</script>

<div class="relative inline-block">
  <div bind:this={triggerElement} class="trigger-element">
    <slot />
  </div>

  {#if showTooltip}
    <div class="tooltip tooltip-{placement} tooltip-{theme} rounded-md">
      <div class="tooltip-content">
        <slot name="tooltip" />
        <div class="tooltip-arrow tooltip-arrow-{placement}"></div>
      </div>
    </div>
  {/if}
</div>

<style scoped>
  .dark {
    --tooltip-color: #3b3b3b;
  }
  :root {
    --tooltip-color: #3b3b3b;
  }
  .tooltip {
    display: block;
    position: absolute;
    z-index: 9999;
    pointer-events: none;
  }

  .tooltip-top {
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip-bottom {
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip-content {
    position: relative;
    padding: 0.6rem;
    white-space: nowrap;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    transform: translate(-50%, -50%);
    background-color: var(--tooltip-color);
  }

  .tooltip-arrow:before {
    content: '';
    visibility: visible;
    transform: rotate(45deg) translateX(-50%);
  }

  .tooltip-arrow-bottom {
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0.5rem;
    border-style: solid;
    border-color: transparent transparent var(--tooltip-color) transparent;
  }

  .tooltip-arrow-top {
    top: 28px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0.5rem;
    border-style: solid;
    border-color: var(--tooltip-color) transparent transparent transparent;
  }

  .tooltip-default {
    background-color: var(--tooltip-color);
    color: #ffffff;
  }

  .tooltip-primary {
    background-color: var(--tooltip-color);
    color: #ffffff;
  }
</style>
