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

export interface StepperItem {
  title: string
  desc: string
}

export interface RecognizeResult {
  text: string
  words: Array
  lines: Array
}

/* Gemini AI Parts */

export interface GeminiParams {
  query: string
  history: Array
}

export interface GeminiItem {
  role: string
  text?: string
  time?: number
  prompt?: string
  prompts?: Array
}
