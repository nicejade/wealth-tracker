<script lang="ts">
  import { Router, createRouter } from '@roxi/routify'
  import routes from '../.routify/routes.default.js'
  import Alert from './components/Alert.svelte'
  import Notice from './components/Notice.svelte'
  import './assets/styles/app.css'

  routes.children.forEach((element) => {
    element.name = element.name.toLowerCase()
  })
  const router = createRouter({ routes })
</script>

<main id="main" class="flex flex-col w-full h-full max-w-2xl md:px-4 m-auto mx-auto">
  <Router {router} />
</main>

<Alert />
<Notice />
