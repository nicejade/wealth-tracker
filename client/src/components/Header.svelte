<script lang="ts">
  import { onMount } from 'svelte'
  import SvgIcon from './SvgIcon.svelte'
  import { TITLE, DEFAULT_THEME } from './../helper/constant'

  let appThemeMode = DEFAULT_THEME

  onMount(() => {
    appThemeMode = localStorage.getItem('theme-mode') || DEFAULT_THEME
    updateAppTheme()
  })

  const updateAppTheme = () => {
    const isDarkMode = !(appThemeMode === DEFAULT_THEME)
    document.querySelector('html').style.filter = isDarkMode ? 'invert(1) hue-rotate(180deg)' : ''
  }

  const onToggleTheme = () => {
    appThemeMode = appThemeMode === DEFAULT_THEME ? 'dark' : DEFAULT_THEME
    updateAppTheme()
    localStorage.setItem('theme-mode', appThemeMode)
  }
</script>

<header class="flex h-20 items-center justify-between">
  <h1 class="h-full leading-none">
    <a href="/" title={TITLE} class="flex h-full items-center space-x-2">
      <img src="/logo.png" alt="Sink" class="h-5 w-5" />
      <span class="title text-xl font-semibold">{TITLE}</span>
    </a>
  </h1>
  <nav class="flex h-full items-center space-x-3">
    <a
      target="_blank"
      rel="noopener"
      class="inline-flex rounded-md p-2 leading-5 outline-none hover:bg-gray-100"
      href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fnicejade%2Fwealth-tracker&text=%E7%94%9F%E8%B4%A2%E6%9C%89%E8%BF%B9%EF%BC%88Wealth%20Tracker%EF%BC%89%E6%98%AF%E4%B8%80%E6%AC%BE%E4%B8%93%E6%B3%A8%E4%BA%8E%E4%B8%AA%E4%BA%BA%E8%B5%84%E4%BA%A7%E5%88%86%E6%9E%90%E7%9A%84%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E3%80%82"
      title="Twitter">
      <SvgIcon name="x" width={20} height={20} color="#212121" />
    </a>
    <button
      on:click={onToggleTheme}
      class="ring-offset-background focus-visible:ring-ring hover:text-accent-foreground inline-flex
      items-center justify-center whitespace-nowrap rounded-md p-2 text-sm font-medium leading-5 outline-none
      transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {#if appThemeMode === 'light'}
        <SvgIcon name="light" width={20} height={20} color="#212121" />
      {:else}
        <SvgIcon name="dark" width={20} height={20} color="#212121" />
      {/if}
      <span class="sr-only">Toggle Theme</span>
    </button>
    <a
      href="https://github.com/nicejade/wealth-tracker"
      target="_blank"
      rel="noopener"
      title="Github"
      class="inline-flex w-full items-center rounded-full bg-gray-900 px-6 py-3 text-sm
      leading-4 text-white hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-0 focus:ring-gray-800
      focus:ring-offset-2 md:hidden md:w-auto md:rounded-full md:px-3 md:focus:ring-2">
      <SvgIcon name="githubx" width={20} height={20} color="#ffffff" />
      <strong class="ml-2 font-semibold">GitHub</strong>
    </a>
  </nav>
</header>

<style>
  .title {
    background: linear-gradient(to top left, #e65c00, #f8d826);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
