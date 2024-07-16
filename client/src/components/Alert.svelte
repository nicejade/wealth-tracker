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
    await sleep(5000)
    hideAlert()
  }

  const onCloseClick = () => {
    hideAlert()
  }
</script>

{#if $alert}
  <div
    class="absolute z-50 flex items-center p-4 mb-4 rounded-lg text-mark w-max top-16 right-1/2 translate-x-2/4 bg-blue-50"
    role="alert"
    id="alert-info"
    transition:fade={{ delay: 100, duration: 300 }}>
    <SvgIcon name="info" color="#ff4582" />
    <span class="sr-only">Info</span>
    <div
      class="ml-3 text-base md:text-sm max-w-xl md:max-w-xs overflow-hidden text-ellipsis">
      {$alert}
    </div>
    <button
      type="button"
      data-dismiss-target="#alert-info"
      class="ml-auto -mx-1.5 -my-1.5 bg-blue-50 text-mark rounded-lg p-1.5 hover:bg-blue-200 inline-flex h-8 w-8"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#ff4582" />
    </button>
  </div>
{/if}
