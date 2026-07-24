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
    class="liquid-glass z-100 fixed right-1/2 top-16 z-50 mb-4 flex w-max max-w-[min(36rem,calc(100vw-2rem))] translate-x-2/4 items-center space-x-3 rounded-2xl p-3.5"
    role="status"
    id="notice-info"
    transition:fade={{ delay: 100, duration: 250 }}>
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
      <SvgIcon name="notice" color="#2edfa3" />
    </div>
    <span class="sr-only">Info</span>
    <div class="ml-0 text-base font-medium tracking-tight text-ink-primary md:text-sm">
      {$notice}
    </div>
    <button
      type="button"
      data-dismiss-target="#notice-info"
      class="-mx-0.5 -my-0.5 ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 transition-colors duration-180 ease-apple hover:bg-emerald-100"
      aria-label="Close"
      on:click={onCloseClick}>
      <SvgIcon name="close" color="#2edfa3" />
    </button>
  </div>
{/if}
