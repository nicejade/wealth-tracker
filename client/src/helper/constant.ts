import dayjs from 'dayjs'

export const TITLE = '生财有迹'

export const DESCRIPTION =
  '生财有迹（Wealth Tracker）是一款专注于个人资产分析的应用程序。其核心功能是：全面记录并展示用户的资产状况，帮助用户清晰地了解财务现状；结合每种资产的特性和当前经济环境，利用 AI 技术进行分析，并提供适宜的财务建议。'

export const DEFAULT_THEME = 'light'

export const ACTION_TYPES = {
  create: 'create-account',
  update: 'update-account',
  change: 'change-record',
}

const dayOffsetArr = [7, 28, 98, 364]

export const DATE_EXTENT_ARR = dayOffsetArr.map((day) => {
  const dayOffsetDay = day - 1
  return {
    name: `最近 ${day} 天`,
    value: dayjs().subtract(dayOffsetDay, 'day').format('YYYY-MM-DD'),
  }
})

export const ASSETS_RISK_ARR = [
  {
    name: '低',
    value: 'LOW',
  },
  {
    name: '中',
    value: 'MIDDLE',
  },
  {
    name: '高',
    value: 'HIGH',
  },
]

export const ASSETS_LIQUIDITY_ARR = [
  {
    name: '好',
    value: 'GOOD',
  },
  {
    name: '中',
    value: 'MIDDLE',
  },
  {
    name: '差',
    value: 'POOR',
  },
]

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
