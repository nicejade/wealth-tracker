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

export const RISK_TYPES = ['LOW', 'MIDDLE', 'HIGH']

export const ASSETS_RISK_ARR = RISK_TYPES.map((value) => ({
  key: `${value.toLowerCase()}`,
  value: value,
}))

export const LIQUIDITY_TYPES = ['GOOD', 'MIDDLE', 'POOR']

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
    title: '静轩之别苑',
    icon: 'blogger',
  },
  {
    href: 'https://x.com/MarshalXuan',
    title: 'X',
    icon: 'x',
  },
  {
    href: 'https://www.niceshare.site/',
    title: '逍遥自在轩',
    icon: 'homepage',
  },
  {
    href: 'https://www.thebettersites.com/',
    title: '清风明月轩',
    icon: 'thebettersites',
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

export const STORAGE_RISK_FILTER = 'risk-filter'

export const STORAGE_LIQUIDITY_FILTER = 'liquidity-filter'

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

export const TARGET_CURRENCY = 'target-currency'

export const EXCHANGE_RATE_API_KEY = 'exchange-rate-api-key'
export const BITCOIN_API_KEY = 'bitcoin-api-key'

export const SUPPORTED_CURRENCIES = [
  {
    value: 'CNY',
  },
  {
    value: 'USD',
  },
  {
    value: 'HKD',
  },
  {
    value: 'BTC',
  },
  {
    value: 'EUR',
  },
  {
    value: 'JPY',
  },
  {
    value: 'GBP',
  },
  {
    value: 'TWD',
  },
  {
    value: 'KRW',
  },
  {
    value: 'AUD',
  },
  {
    value: 'CAD',
  },
  {
    value: 'SGD',
  },
  {
    value: 'CHF',
  },
]

export const DEFAULT_EXCHANGE_RATE = {
  base_code: 'CNY',
  conversion_rates: {
    BTC: 0.0000011941,
    CNY: 1,
    AED: 0.5026,
    AFN: 10.158,
    ALL: 13.0938,
    AMD: 54.7073,
    ANG: 0.245,
    AOA: 126.6161,
    ARS: 144.5145,
    AUD: 0.2185,
    AWG: 0.245,
    AZN: 0.2334,
    BAM: 0.2593,
    BBD: 0.2737,
    BDT: 16.6231,
    BGN: 0.2593,
    BHD: 0.05146,
    BIF: 407.1731,
    BMD: 0.1369,
    BND: 0.1857,
    BOB: 0.9515,
    BRL: 0.7935,
    BSD: 0.1369,
    BTN: 12.0023,
    BWP: 1.8982,
    BYN: 0.4513,
    BZD: 0.2737,
    CAD: 0.1963,
    CDF: 392.0926,
    CHF: 0.1245,
    CLP: 132.2965,
    COP: 566.4997,
    CRC: 69.8344,
    CUP: 3.2847,
    CVE: 14.6193,
    CZK: 3.3307,
    DJF: 24.3231,
    DKK: 0.9895,
    DOP: 8.5063,
    DZD: 18.5631,
    EGP: 6.9048,
    ERN: 2.0529,
    ETB: 17.5855,
    EUR: 0.1326,
    FJD: 0.3172,
    FKP: 0.1104,
    FOK: 0.9889,
    GBP: 0.1104,
    GEL: 0.3823,
    GGP: 0.1104,
    GHS: 2.1183,
    GIP: 0.1104,
    GMD: 9.955,
    GNF: 1177.5816,
    GTQ: 1.0609,
    GYD: 28.7677,
    HKD: 1.0688,
    HNL: 3.499,
    HRK: 0.999,
    HTG: 17.9432,
    HUF: 53.7579,
    IDR: 2226.4752,
    ILS: 0.4871,
    IMP: 0.1104,
    INR: 11.9918,
    IQD: 179.4322,
    IRR: 5973.1953,
    ISK: 19.3884,
    JEP: 0.1104,
    JMD: 21.6577,
    JOD: 0.09703,
    JPY: 20.7843,
    KES: 17.7214,
    KGS: 11.9999,
    KHR: 549.9481,
    KID: 0.2185,
    KMF: 65.2269,
    KRW: 199.0036,
    KWD: 0.04234,
    KYD: 0.1141,
    KZT: 70.0643,
    LAK: 3007.1916,
    LBP: 12249.0826,
    LKR: 40.8458,
    LRD: 27.3081,
    LSL: 2.5388,
    LYD: 0.6737,
    MAD: 1.3742,
    MDL: 2.5662,
    MGA: 641.6061,
    MKD: 8.1062,
    MMK: 393.1685,
    MNT: 474.7613,
    MOP: 1.1008,
    MRU: 5.4945,
    MUR: 6.3906,
    MVR: 2.1212,
    MWK: 238.2096,
    MXN: 2.8232,
    MYR: 0.6087,
    MZN: 8.7361,
    NAD: 2.5388,
    NGN: 205.9854,
    NIO: 5.0502,
    NOK: 1.5426,
    NPR: 19.2036,
    NZD: 0.2419,
    OMR: 0.05262,
    PAB: 0.1369,
    PEN: 0.5098,
    PGK: 0.5517,
    PHP: 7.9529,
    PKR: 38.2092,
    PLN: 0.5562,
    PYG: 1083.5974,
    QAR: 0.4982,
    RON: 0.658,
    RSD: 15.5123,
    RUB: 13.281,
    RWF: 191.8944,
    SAR: 0.5132,
    SBD: 1.1646,
    SCR: 2.0164,
    SDG: 61.371,
    SEK: 1.5,
    SGD: 0.1857,
    SHP: 0.1104,
    SLE: 3.1262,
    SLL: 3127.0105,
    SOS: 78.4185,
    SRD: 4.823,
    SSP: 592.7959,
    STN: 3.2483,
    SYP: 1774.7705,
    SZL: 2.5388,
    THB: 4.6314,
    TJS: 1.4993,
    TMT: 0.4802,
    TND: 0.4378,
    TOP: 0.3308,
    TRY: 4.9357,
    TTD: 0.9308,
    TVD: 0.2185,
    TWD: 4.5014,
    TZS: 352.8228,
    UAH: 5.694,
    UGX: 503.9568,
    USD: 0.1368,
    UYU: 5.9677,
    UZS: 1768.0458,
    VES: 8.3046,
    VND: 3462.2267,
    VUV: 16.7093,
    WST: 0.3878,
    XAF: 86.9692,
    XCD: 0.3695,
    XDR: 0.105,
    XOF: 86.9692,
    XPF: 15.8215,
    YER: 34.1211,
    ZAR: 2.5392,
    ZMW: 3.8698,
    ZWL: 0.8767,
  },
}
