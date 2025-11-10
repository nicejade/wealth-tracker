import { FastifyRequest, FastifyReply } from 'fastify'
import UserSettings from '../models/userSettings'

export const getUserSettings = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    // 获取或创建用户设置（单用户应用，只有一个设置记录）
    let settings = await UserSettings.findOne({ where: {} })
    if (!settings) {
      settings = await UserSettings.create({
        theme: 'light',
        language: 'zh-CN',
        targetCurrency: 'CNY',
        exchangeRateApiKey: '',
        bitcoinApiKey: '',
        apiKey: '',
        baseURL: 'https://api.x.ai/v1/',
        model: 'grok-beta',
        temperature: 0.7,
      })
    }

    return {
      success: true,
      data: {
        theme: settings.theme || 'light',
        language: settings.language || 'zh-CN',
        targetCurrency: settings.targetCurrency || 'CNY',
        exchangeRateApiKey: settings.exchangeRateApiKey || '',
        bitcoinApiKey: settings.bitcoinApiKey || '',
        apiKey: settings.apiKey || '',
        baseURL: settings.baseURL || 'https://api.x.ai/v1/',
        model: settings.model || 'grok-beta',
        temperature: settings.temperature || 0.7,
      },
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to get user settings',
    })
  }
}

export const updateUserSettings = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const {
      theme,
      language,
      targetCurrency,
      exchangeRateApiKey,
      bitcoinApiKey,
      apiKey,
      baseURL,
      model,
      temperature,
    } = request.body as {
      theme?: string
      language?: string
      targetCurrency?: string
      exchangeRateApiKey?: string
      bitcoinApiKey?: string
      apiKey?: string
      baseURL?: string
      model?: string
      temperature?: number
    }

    // 获取或创建用户设置
    let settings = await UserSettings.findOne({ where: {} })

    const updateData: any = {}
    if (theme !== undefined) updateData.theme = theme
    if (language !== undefined) updateData.language = language
    if (targetCurrency !== undefined) updateData.targetCurrency = targetCurrency
    if (exchangeRateApiKey !== undefined) updateData.exchangeRateApiKey = exchangeRateApiKey
    if (bitcoinApiKey !== undefined) updateData.bitcoinApiKey = bitcoinApiKey
    if (apiKey !== undefined) updateData.apiKey = apiKey
    if (baseURL !== undefined) updateData.baseURL = baseURL
    if (model !== undefined) updateData.model = model
    if (temperature !== undefined) updateData.temperature = temperature

    if (settings) {
      await settings.update(updateData)
    } else {
      settings = await UserSettings.create({
        theme: 'light',
        language: 'zh-CN',
        targetCurrency: 'CNY',
        exchangeRateApiKey: '',
        bitcoinApiKey: '',
        apiKey: '',
        baseURL: 'https://api.x.ai/v1/',
        model: 'grok-beta',
        temperature: 0.7,
        ...updateData,
      })
    }

    return {
      success: true,
      data: {
        theme: settings.theme,
        language: settings.language,
        targetCurrency: settings.targetCurrency,
        exchangeRateApiKey: settings.exchangeRateApiKey,
        bitcoinApiKey: settings.bitcoinApiKey,
        apiKey: settings.apiKey,
        baseURL: settings.baseURL,
        model: settings.model,
        temperature: settings.temperature,
      },
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to update user settings',
    })
  }
}
