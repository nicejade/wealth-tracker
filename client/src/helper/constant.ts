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

export const DATE_EXTENT_ARR = [7, 28, 91, 182, 364].map((day) => {
  const dayOffsetDay = day - 1
  return {
    days: day,
    key: 'lastDays',
    value: dayjs().subtract(dayOffsetDay, 'day').format('YYYY-MM-DD'),
  }
})

export const DATE_PERIOD_ARR = [98, 196, 280, 364, 616].map((day) => {
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
  type: Date.now().toString(),
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
    href: 'https://x.com/MarshalXuan',
    title: 'X',
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

export const PROMPT_TEMPLATE = `As a professional financial advisor with extensive experience in wealth management and market insights, please provide personalized financial advice based on the following user information and market conditions.

## Asset Details
- Total Assets: {total} 

- Current Asset Allocation:
  {status}

## Market Environment
- AI will independently analyze and understand market conditions based on current market environment and macroeconomic indicators

## Output Requirements
Based on the above information, please provide advice on:

1. Asset Allocation Recommendations
  - Recommended allocation ratios for each asset class
  - Specific reasons for allocation adjustments
  - Risk control measures

2. Investment Strategy Recommendations
  - Short-term investment opportunities
  - Medium to long-term investment planning
  - Risk areas to avoid

3. Financial Product Recommendations
  - Product types matching user's risk tolerance
  - Specific product examples with pros and cons analysis
  - Purchase recommendations and key considerations

4. Financial Planning Advice
  - Cash flow management suggestions
  - Tax planning recommendations
  - Insurance coverage recommendations

5. Special Considerations
  - Market risk warnings
  - Policy change impacts
  - Personal circumstances considerations

6. Additional Considerations:
  - Economic cycle position and impact
  - Global market correlations
  - ESG factors if applicable
  - Digital asset considerations if relevant
  - Emergency fund adequacy
  - Retirement planning implications

Please ensure recommendations:
  - Match user's risk tolerance
  - Consider liquidity needs
  - Align with current market conditions
  - Provide actionable steps
  - Include risk disclaimers
  - Offer specific implementation steps
  - Respond in {language}`
