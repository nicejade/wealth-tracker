<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import './lang/i18n'
  import { Router, createRouter } from '@roxi/routify'
  import routes from '../.routify/routes.default.js'
  import Alert from './components/Alert.svelte'
  import Notice from './components/Notice.svelte'
  import Loading from './components/Loading.svelte'
  import FillPassword from './components/FillPassword.svelte'
  import { initializeAuth } from './helper/auth'
  import { loadUserSettings } from './helper/settings'
  import { trackPageView } from './helper/analytics'
  import { isAuthenticated, isLoading, customCurrencies } from './stores'
  import { getCustomCurrencies } from './helper/apis'
  import './assets/styles/app.css'

  routes.children.forEach((element) => {
    element.name = element.name.toLowerCase()
  })

  onMount(async () => {
    await initializeAuth()
    // 加载用户设置（在认证后加载，但如果未认证也尝试加载，因为设置 API 可能不需要认证）
    try {
      await loadUserSettings()
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
    // 加载自定义货币
    try {
      const response: any = await getCustomCurrencies()
      if (response.success) {
        customCurrencies.set(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load custom currencies:', error)
    }
  })

  const router = createRouter({
    routes,
  })

  // 订阅路由变化以发送页面浏览数据
  router.activeRoute.subscribe((route) => {
    if (route && route.url) {
      // 延迟一下确保 document.title 已经更新（如果是在组件中更新的）
      setTimeout(() => {
        trackPageView(route.url)
      }, 100)
    }
  })
</script>

<main
  id="main"
  class="m-auto mx-auto flex h-full w-full max-w-3xl flex-col md:max-w-full md:px-4 lg:max-w-4xl">
  {#if $isLoading}
    <div class="flex h-[100vh] w-full items-center justify-center">
      <Loading></Loading>
    </div>
  {:else}
    <FillPassword />
    {#if $isAuthenticated}
      <Router {router} />
    {/if}
  {/if}
</main>

<Alert />
<Notice />
