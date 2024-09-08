import dayjs from 'dayjs'
import { _ } from 'svelte-i18n'

export const TITLE = '生财有迹'

export const DESCRIPTION =
  '生财有迹（Wealth Tracker）是一款专注于个人资产分析的应用程序。其核心功能是：全面记录并展示用户的资产状况，帮助用户清晰地了解财务现状；结合每种资产的特性和当前经济环境，利用 AI 技术进行分析，并提供适宜的财务建议。'

export const ACTION_TYPES = {
  create: 'create-account',
  update: 'update-account',
  change: 'change-record',
}

const dayOffsetArr = [7, 28, 98, 364]

export const DATE_EXTENT_ARR = dayOffsetArr.map((day) => {
  const dayOffsetDay = day - 1
  return {
    days: day,
    key: 'lastDays',
    value: dayjs().subtract(dayOffsetDay, 'day').format('YYYY-MM-DD'),
  }
})

export const ASSETS_RISK_ARR = ['LOW', 'MIDDLE', 'HIGH'].map((value) => ({
  key: `${value.toLowerCase()}`,
  value: value,
}))

export const ASSETS_LIQUIDITY_ARR = ['GOOD', 'MIDDLE', 'POOR'].map((value) => ({
  key: `${value.toLowerCase()}`,
  value: value,
}))

export const SOCIAL_LINKS = [
  {
    href: 'https://mastodon.social/@nicejade',
    title: 'Mastodon',
    icon: 'mastodon',
  },
  {
    href: 'https://quickapp.lovejade.cn/',
    title: 'Blogger',
    icon: 'blogger',
  },
  {
    href: 'https://x.com/nicejadeyang',
    title: 'Twitter',
    icon: 'x',
  },
  {
    href: 'https://www.niceshare.site/',
    title: 'Home Page',
    icon: 'homepage',
  },
  {
    href: 'https://github.com/nicejade/',
    title: 'Github',
    icon: 'github',
  },
]

export const LANG_ARR = [
  {
    name: '简体中文',
    value: 'zh',
  },
  {
    name: '繁體中文',
    value: 'zh-tw',
  },
  {
    name: 'English',
    value: 'en',
  },
  {
    name: '日本語',
    value: 'ja',
  },
  {
    name: 'Français',
    value: 'fr',
  },
]

export const DEFAULT_THEME = 'light'

export const DEFAULT_LANG = 'zh'

export const STORAGE_THEME = 'theme'

export const STORAGE_LANG = 'lang'
