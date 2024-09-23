export interface GptParams {
  id?: string
  key?: string
  text?: string
  size?: string
}

export interface GptReply {
  id: string
  role: string
  text: string
  delta?: string
  usage?: object
  parentMessageId?: string
  model?: string
  stream?: number
  prompt?: string
}

export interface ChatItem {
  id?: string
  role?: string
  text?: string
  time?: number
  data?: Array
  model?: string
  prompt?: string
  size?: string
}

export interface SelectItem {
  name: string
  value?: string
  disabled?: boolean
}

export interface RecordsItem {
  page?: number
  size?: number
  total?: number
  data?: any[]
}

export interface WealthItem {
  type: string
  amount: number
  currency: string
  risk: string
  liquidity: string
  datetime: string
  note: string
}
