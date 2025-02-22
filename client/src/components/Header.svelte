<script lang="ts">
  import { onMount } from 'svelte'
  import { Dropdown, DropdownItem } from 'flowbite-svelte'
  import { locale } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { language, theme } from '../stores'
  import { getAppLang } from './../helper/utils'
  import { TITLE, DEFAULT_THEME, LANG_ARR, STORAGE_THEME, STORAGE_LANG } from './../helper/constant'

  let lang: string = getAppLang()
  let langName: string = ''

  $: if (lang) {
    langName = LANG_ARR.find((item) => {
      return item.value === lang
    }).name
    locale.set(lang)
    language.set(lang)
    localStorage.setItem(STORAGE_LANG, lang)
  }

  onMount(() => {
    theme.set(localStorage.getItem(STORAGE_THEME) || DEFAULT_THEME)
    updateAppTheme()
  })

  const updateAppTheme = () => {
    const isDarkMode = !($theme === DEFAULT_THEME)
    localStorage.setItem(STORAGE_THEME, $theme)
    document.querySelector('html').style.filter = isDarkMode ? 'invert(1) hue-rotate(180deg)' : ''
  }

  const onToggleTheme = () => {
    theme.set($theme === DEFAULT_THEME ? 'dark' : DEFAULT_THEME)
    updateAppTheme()
  }

  const handleDropdownClick = (item) => {
    lang = item.value
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
      href="https://x.com/intent/user?screen_name=MarshalXuan"
      title="X | Twitter Follow MarshalXuan">
      <SvgIcon name="x" width={20} height={20} color="#212121" />
    </a>
    <button
      on:click={onToggleTheme}
      class="ring-offset-background focus-visible:ring-ring hover:text-accent-foreground inline-flex
      items-center justify-center whitespace-nowrap rounded-md p-2 text-sm font-medium leading-5 outline-none
      transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {#if $theme === 'light'}
        <SvgIcon name="light" width={20} height={20} color="#212121" />
      {:else}
        <SvgIcon name="dark" width={20} height={20} color="#212121" />
      {/if}
      <span class="sr-only">Toggle Theme</span>
    </button>

    <div class="flex text-base">
      <div class="space-between text-md flex w-28 cursor-pointer items-center">
        <SvgIcon name="lang" width={20} height={20} color="#212121" />
        <span class="w-16 overflow-hidden text-ellipsis text-nowrap">{langName}</span>
        <SvgIcon name="chevron-down" width={20} height={20} color="#212121" />
      </div>
      <Dropdown class="w-28 drop-shadow-sm" arrow trigger="hover">
        {#each LANG_ARR as item (item)}
          <DropdownItem
            on:click={() => {
              handleDropdownClick(item)
            }}>
            <span class="text-base font-medium">{item.name}</span>
          </DropdownItem>
        {/each}
      </Dropdown>
    </div>

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
