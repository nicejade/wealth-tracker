<script lang="ts">
  import { onMount } from 'svelte'

  export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay || 1000))

  let counter = 10

  onMount(async () => {
    while (counter > 1) {
      await sleep(1000)
      counter -= 1
    }
    await sleep(1000)
    location.href = '/'
  })
</script>

<div
  class="mt-4 flex w-full flex-row flex-wrap items-center justify-between overflow-x-hidden px-4 pt-[64px]">
  <div class="m-auto text-center">
    <img class="w-full max-w-md" src="/404.webp" alt="404 Not Found" />
    <h1 class="text-2xl font-bold text-black">Sorry, the page was not found.</h1>
    <p class="mt-3 text-gray-600">
      Click below to return to Home page or go to the Github Repository We will auto-redirect in <i
        class="text-brand">
        {counter}
      </i>
      seconds.：
    </p>
    <div class="mt-3 flex flex-row items-center justify-center space-x-3">
      <a
        class="border-brand text-brand min-w-28 rounded-full border bg-white px-4 py-2 text-base font-bold hover:bg-gray-100 md:text-sm"
        href="/">
        Home Page
      </a>
      <a
        class=" min-w-28 rounded-full border border-gray-300 bg-white px-4 py-2 text-base font-bold text-gray-600 hover:bg-gray-100 md:text-sm"
        target="_blank"
        href="https://github.com/nicejade/wealth-tracker">
        Github Repository
      </a>
    </div>
  </div>
</div>
