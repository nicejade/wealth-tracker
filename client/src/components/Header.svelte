<script lang="ts">
  import { onMount } from 'svelte'
  import { Dropdown, DropdownItem } from 'flowbite-svelte'
  import { locale } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { language, theme } from '../stores'
  import { trackEvent } from '../helper/analytics'
  import { saveUserSettings } from './../helper/settings'
  import { TITLE, DEFAULT_THEME, LANG_ARR } from './../helper/constant'

  let lang: string = $language || 'zh-CN'
  let langName: string = ''

  $: if ($language) {
    lang = $language
    langName =
      LANG_ARR.find((item) => {
        return item.value === lang
      })?.name || ''
    locale.set(lang)
    updateAppFont(lang)
  }

  // 监听主题变化，更新 UI
  $: if ($theme) {
    updateAppTheme()
  }

  // 监听语言变化，更新 UI
  $: if ($language && $language !== lang) {
    lang = $language
    updateUrlLang($language)
    updateAppFont($language)
  }

  onMount(() => {
    // 从 store 获取主题和语言（已经从服务器加载）
    updateAppTheme()
    updateAppFont($language)

    // 确保在组件挂载时也能正确处理 URL 参数中的语言
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang && urlLang !== $language) {
      language.set(urlLang)
      updateUrlLang(urlLang)

      saveUserSettings({ language: urlLang }).catch((err) => {
        console.error('Failed to save language from URL:', err)
      })
    }

    // 监听浏览器前进/后退按钮，确保 URL 参数变化时能正确响应
    const handlePopState = () => {
      const currentUrlParams = new URLSearchParams(window.location.search)
      const currentUrlLang = currentUrlParams.get('lang')
      if (currentUrlLang && currentUrlLang !== $language) {
        language.set(currentUrlLang)
        updateUrlLang(currentUrlLang)
        saveUserSettings({ language: currentUrlLang }).catch((err) => {
          console.error('Failed to save language from URL:', err)
        })
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  })

  const updateAppTheme = () => {
    const isDarkMode = !($theme === DEFAULT_THEME)
    const root = document.documentElement
    root.style.filter = isDarkMode ? 'invert(1) hue-rotate(180deg)' : ''
    // Used by CSS to strengthen borders under invert-based dark theme
    root.classList.toggle('theme-dark', isDarkMode)
    root.dataset.theme = isDarkMode ? 'dark' : 'light'
  }

  const updateAppFont = (languageCode: string = 'zh-CN') => {
    const FONT_CONFIG = {
      'zh-CN':
        '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif',
      'zh-TW':
        '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans SC", "Microsoft JhengHei", sans-serif',
      en: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      ja: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", sans-serif',
      fr: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
    }
    const fontFamily = FONT_CONFIG[languageCode] || FONT_CONFIG['en']
    document.documentElement.style.setProperty('--app-font-family', fontFamily)
    document.body.style.fontFamily = fontFamily
  }

  const updateUrlLang = (newLang: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    window.history.pushState({}, '', url.toString())
  }

  const onToggleTheme = async () => {
    const newTheme = $theme === DEFAULT_THEME ? 'dark' : DEFAULT_THEME
    theme.set(newTheme)
    trackEvent('theme-toggle', { theme: newTheme })
    // 保存到服务器（响应式更新会自动触发，但这里显式调用以确保立即保存）
    await saveUserSettings({ theme: newTheme }).catch((err) => {
      console.error('Failed to save theme:', err)
    })
  }

  const handleDropdownClick = async (item) => {
    lang = item.value
    language.set(item.value)
    updateUrlLang(item.value)
    trackEvent('language-change', { language: item.value })

    await saveUserSettings({ language: item.value }).catch((err) => {
      console.error('Failed to save language:', err)
    })
  }
</script>

<header class="flex h-16 items-center justify-between" style="z-index: 1000;">
  <h1 class="h-full leading-none">
    <a
      href="/"
      title={TITLE}
      class="group flex h-full items-center space-x-2.5 focus-visible:outline-none"
      on:click={() => trackEvent('logo-click')}>
      <img
        src="/logo.png"
        alt="Sink"
        class="h-5 w-5 rounded-[6px] shadow-soft transition-transform duration-250 ease-apple group-hover:scale-105 group-active:scale-95" />
      <span class="title font-[cursive] text-xl font-semibold">{TITLE}</span>
    </a>
  </h1>
  <nav class="flex h-full items-center gap-0.5">
    <a
      target="_blank"
      rel="noopener"
      class="focus-visible-ring inline-flex rounded-full p-2.5 leading-5 outline-none transition-colors duration-250 ease-apple hover:bg-black/[0.04] active:scale-95"
      href="https://x.com/intent/user?screen_name=MarshalXuan"
      title="X | Twitter Follow MarshalXuan"
      on:click={() => trackEvent('social-link-click', { platform: 'x' })}>
      <SvgIcon name="x" width={18} height={18} color="#1D1D1F" />
    </a>
    <button
      on:click={onToggleTheme}
      class="focus-visible-ring inline-flex items-center justify-center whitespace-nowrap rounded-full p-2.5 text-sm font-medium leading-5 outline-none transition-colors duration-250 ease-apple hover:bg-black/[0.04] active:scale-95">
      {#if $theme === 'light'}
        <SvgIcon name="light" width={18} height={18} color="#1D1D1F" />
      {:else}
        <SvgIcon name="dark" width={18} height={18} color="#1D1D1F" />
      {/if}
      <span class="sr-only">Toggle Theme</span>
    </button>

    <div class="lang-menu relative flex items-center">
      <div
        class="focus-visible-ring flex min-w-[6.5rem] cursor-pointer items-center gap-0.5 rounded-full px-2 py-1.5 transition-colors duration-250 ease-apple hover:bg-black/[0.04]">
        <SvgIcon name="lang" width={18} height={18} color="#1D1D1F" />
        <span
          class="max-w-[4.5rem] overflow-hidden text-ellipsis text-nowrap text-sm font-medium tracking-tight text-ink-secondary"
          >{langName}</span>
        <SvgIcon name="chevron-down" width={16} height={16} color="#86868B" />
      </div>
      <Dropdown
        arrow={false}
        trigger="hover"
        placement="bottom-end"
        offset={6}
        class="!m-0 !w-full !space-y-0 !py-0"
        classContainer="lang-dropdown z-[120] min-w-[9.5rem] overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-elevated">
        {#each LANG_ARR as item (item.value)}
          <DropdownItem
            defaultClass="w-full rounded-xl px-3 py-2 text-left text-sm font-medium tracking-tight transition-colors duration-150 ease-apple hover:bg-black/[0.04] focus:bg-black/[0.04] focus:outline-none"
            class={item.value === lang
              ? 'bg-blue-soft text-blue hover:bg-blue-soft'
              : 'text-ink-primary'}
            on:click={() => {
              handleDropdownClick(item)
            }}>
            <span class="flex items-center justify-between gap-3">
              <span>{item.name}</span>
              {#if item.value === lang}
                <SvgIcon name="check" width={16} height={16} color="#0071E3" />
              {/if}
            </span>
          </DropdownItem>
        {/each}
      </Dropdown>
    </div>

    <a
      href="https://github.com/nicejade/wealth-tracker"
      target="_blank"
      rel="noopener"
      title="Github"
      class="ml-1 inline-flex items-center rounded-full bg-ink-primary px-4 py-2 text-sm leading-4 text-white shadow-soft transition-all duration-250 ease-apple hover:opacity-90 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-ink-primary/20 focus:ring-offset-2 active:scale-[0.98] md:hidden md:w-auto md:px-3"
      on:click={() => trackEvent('social-link-click', { platform: 'github' })}>
      <SvgIcon name="githubx" width={18} height={18} color="#ffffff" />
      <strong class="ml-2 font-semibold tracking-tight">GitHub</strong>
    </a>
  </nav>
</header>

<style>
  .title {
    background: linear-gradient(to top left, #e65c00, #f8d826);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Flatten Flowbite dropdown chrome: no extra top gap from arrow / divide-y */
  :global(.lang-dropdown) {
    border-color: var(--color-line) !important;
    box-shadow: var(--shadow-elevated) !important;
  }

  :global(.lang-dropdown ul) {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global(.lang-dropdown li) {
    margin: 0;
    padding: 0;
  }

  :global(html.theme-dark .lang-dropdown) {
    border-color: var(--color-line) !important;
    background-color: #ffffff !important;
  }
</style>
