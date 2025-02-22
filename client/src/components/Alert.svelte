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
    class="z-100 fixed right-1/2 top-16 z-50 mb-4 flex w-max translate-x-2/4 items-center space-x-2 rounded-lg bg-white p-4 shadow"
    role="alert"
    id="alert-info"
    transition:fade={{ delay: 100, duration: 300 }}>
    <div class="flex h-8 w-8 items-center rounded-lg bg-red-50 px-2">
      <SvgIcon name="info" color="#ff4582" />
    </div>
    <span class="sr-only">Info</span>
    <div
      class="text-mark ml-3 max-w-xl overflow-hidden text-ellipsis text-base md:max-w-xs md:text-sm">
      {$alert}
    </div>
    <button
      type="button"
      data-dismiss-target="#alert-info"
      class="text-mark -mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg bg-red-50 p-1.5"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#ff4582" />
    </button>
  </div>
{/if}
