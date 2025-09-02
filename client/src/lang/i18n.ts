import { register, init } from 'svelte-i18n'
import { getAppLang } from './../helper/utils'

register('zh-CN', () => import('./zh.json'))
register('zh-TW', () => import('./zh-tw.json'))
register('en', () => import('./en.json'))
register('ja', () => import('./ja.json'))
register('fr', () => import('./fr.json'))

function setupI18n() {
  let lang = 'zh-CN'

  // 在客户端环境下才获取语言设置
  if (typeof window !== 'undefined') {
    lang = getAppLang()
  }

  init({
    fallbackLocale: 'zh-CN',
    initialLocale: lang,
  })
}

setupI18n()
