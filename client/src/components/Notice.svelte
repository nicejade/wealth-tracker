<script>
  import { fade } from 'svelte/transition'
  import SvgIcon from './SvgIcon.svelte'
  import { notice } from '../stores'
  import { sleep } from './../helper/utils'

  $: if ($notice) {
    autoHideAlert()
  }

  const hideAlert = () => {
    notice.set('')
  }

  const autoHideAlert = async () => {
    await sleep(5000)
    hideAlert()
  }

  const onCloseClick = () => {
    hideAlert()
  }
</script>

{#if $notice}
  <div
    class="absolute flex items-center p-4 mb-4 rounded-lg bg-success text-white w-max top-16 right-1/2 translate-x-2/4"
    role="alert"
    id="notice-info"
    transition:fade={{ delay: 100, duration: 300 }}>
    <SvgIcon name="notice" color="#ffffff" />
    <span class="sr-only">Info</span>
    <div class="ml-3 text-base md:text-sm">
      {$notice}
    </div>
    <button
      type="button"
      data-dismiss-target="#notice-info"
      class="ml-auto -mx-1.5 -my-1.5 bg-success text-white rounded-lg p-1.5 hover:bg-blue-200 inline-flex h-8 w-8"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#2edfa3" />
    </button>
  </div>
{/if}
