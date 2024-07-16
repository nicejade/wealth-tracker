import './assets/styles/app.css'
import App from './App.svelte'
import 'virtual:svg-icons-register'

const app = new App({
  target: document.getElementById('app'),
})

export default app
