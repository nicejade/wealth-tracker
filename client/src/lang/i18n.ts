import { register, init } from 'svelte-i18n'
import { STORAGE_LANG } from './../helper/constant'

register('en', () => import('./en.json'))
register('zh', () => import('./zh.json'))
register('zh-tw', () => import('./zh-tw.json'))
register('ja', () => import('./ja.json'))
register('fr', () => import('./fr.json'))

const lang = localStorage.getItem(STORAGE_LANG) || 'zh'

init({
  fallbackLocale: lang,
  initialLocale: lang,
})
