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
  import { isAuthenticated, isLoading } from './stores'
  import './assets/styles/app.css'

  routes.children.forEach((element) => {
    element.name = element.name.toLowerCase()
  })

  onMount(async () => {
    await initializeAuth()
  })

  const router = createRouter({
    routes,
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
