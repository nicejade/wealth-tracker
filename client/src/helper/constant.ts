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

export const DATE_EXTENT_ARR = [7, 28, 98, 364].map((day) => {
  const dayOffsetDay = day - 1
  return {
    days: day,
    key: 'lastDays',
    value: dayjs().subtract(dayOffsetDay, 'day').format('YYYY-MM-DD'),
  }
})

export const DATE_PERIOD_ARR = [98, 196, 280, 364].map((day) => {
  const dayOffsetDay = day - 1
  return {
    days: day,
    key: 'lastDays',
    value: dayjs().subtract(dayOffsetDay, 'day').format('YYYY-MM-DD'),
  }
})

const RISK_TYPES = ['LOW', 'MIDDLE', 'HIGH']

export const ASSETS_RISK_ARR = RISK_TYPES.map((value) => ({
  key: `${value.toLowerCase()}`,
  value: value,
}))

const LIQUIDITY_TYPES = ['GOOD', 'MIDDLE', 'POOR']

export const ASSETS_LIQUIDITY_ARR = LIQUIDITY_TYPES.map((value) => ({
  key: `${value.toLowerCase()}`,
  value: value,
}))

export const DEFAULT_ACCOUNT_ITEM = {
  type: '',
  alias: '',
  currency: 'CNY',
  risk: RISK_TYPES[0],
  liquidity: LIQUIDITY_TYPES[0],
  amount: 0,
  datetime: dayjs().format('YYYY-MM-DD'),
  note: '',
}

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
    value: 'zh-CN',
  },
  {
    name: '繁體中文',
    value: 'zh-TW',
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

export const DEFAULT_LANG = 'zh-CN'

export const STORAGE_THEME = 'theme'

export const STORAGE_LANG = 'lang'
