<script>
  import { fade } from 'svelte/transition'
  import SvgIcon from './SvgIcon.svelte'
  import { notice } from '../stores'
  import { sleep } from './../helper/utils'

  $: if ($notice) {
    autoHideNotice()
  }

  const hideNotice = () => {
    notice.set('')
  }

  const autoHideNotice = async () => {
    await sleep(6000)
    hideNotice()
  }

  const onCloseClick = () => {
    hideNotice()
  }
</script>

{#if $notice}
  <div
    class="absolute right-1/2 top-16 mb-4 flex w-max translate-x-2/4 items-center space-x-2 rounded-lg bg-white p-4 shadow"
    role="notice"
    id="notice-info"
    transition:fade={{ delay: 100, duration: 300 }}>
    <div class="flex h-8 w-8 items-center rounded-lg bg-green-100 px-2">
      <SvgIcon name="notice" color="#2edfa3" />
    </div>
    <span class="sr-only">Info</span>
    <div class="ml-3 text-base text-black md:text-sm">
      {$notice}
    </div>
    <button
      type="button"
      data-dismiss-target="#notice-info"
      class="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg p-1.5 text-white hover:bg-green-100"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#2edfa3" />
    </button>
  </div>
{/if}
