import { register, init } from 'svelte-i18n'
import { getAppLang } from './../helper/utils'

register('zh-CN', () => import('./zh.json'))
register('zh-TW', () => import('./zh-tw.json'))
register('en', () => import('./en.json'))
register('ja', () => import('./ja.json'))
register('fr', () => import('./fr.json'))

const lang = getAppLang()

init({
  fallbackLocale: lang,
  initialLocale: lang,
})
