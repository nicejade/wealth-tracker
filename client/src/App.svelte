<script lang="ts">
  import { Router, createRouter } from '@roxi/routify'
  import routes from '../.routify/routes.default.js'
  import Alert from './components/Alert.svelte'
  import Notice from './components/Notice.svelte'
  import './lang/i18n'
  import './assets/styles/app.css'

  routes.children.forEach((element) => {
    element.name = element.name.toLowerCase()
  })
  const router = createRouter({ routes })
</script>

<main
  id="main"
  class="m-auto mx-auto flex h-full w-full max-w-3xl flex-col md:max-w-full md:px-4 lg:max-w-4xl">
  <Router {router} />
</main>

<Alert />
<Notice />
