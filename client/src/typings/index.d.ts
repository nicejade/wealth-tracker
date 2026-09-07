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

export interface AssetsItem {
  type: string
  alias: string
  amount: number
  currency: string
  risk: string
  liquidity: string
  datetime: string
  note: string
  tags?: string
  created?: string
  updated?: string
}

export interface GoalItem {
  id: number
  name: string
  amount: number
  currency: string
  deadline?: string
  achievedAt?: string
  created?: string
  updated?: string
}

export interface Settings {
  [key: string]: string | number
}
