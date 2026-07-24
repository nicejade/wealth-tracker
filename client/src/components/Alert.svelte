<script>
  import { alert } from '../stores'
  import { fade } from 'svelte/transition'
  import SvgIcon from './SvgIcon.svelte'
  import { sleep } from './../helper/utils'

  $: if ($alert) {
    autoHideAlert()
  }

  const hideAlert = () => {
    alert.set('')
  }

  const autoHideAlert = async () => {
    await sleep(6000)
    hideAlert()
  }

  const onCloseClick = () => {
    hideAlert()
  }
</script>

{#if $alert}
  <div
    class="liquid-glass z-100 fixed right-1/2 top-16 z-50 mb-4 flex w-max max-w-[min(36rem,calc(100vw-2rem))] translate-x-2/4 items-center space-x-3 rounded-2xl p-3.5"
    role="alert"
    id="alert-info"
    transition:fade={{ delay: 100, duration: 250 }}>
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
      <SvgIcon name="info" color="#ff4582" />
    </div>
    <span class="sr-only">Info</span>
    <div
      class="text-mark ml-0 max-w-xl overflow-hidden text-ellipsis text-base font-medium tracking-tight md:max-w-xs md:text-sm">
      {$alert}
    </div>
    <button
      type="button"
      data-dismiss-target="#alert-info"
      class="text-mark -mx-0.5 -my-0.5 ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 transition-colors duration-180 ease-apple hover:bg-red-100"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#ff4582" />
    </button>
  </div>
{/if}
