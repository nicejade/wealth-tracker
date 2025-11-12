import { FastifyRequest, FastifyReply } from 'fastify'
import CustomCurrency from '../models/customCurrency'

export const getCustomCurrencies = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const currencies = await CustomCurrency.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: currencies,
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to get custom currencies',
    })
  }
}

export const getAllCustomCurrencies = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const currencies = await CustomCurrency.findAll({
      order: [['createdAt', 'DESC']],
    })

    return {
      success: true,
      data: currencies,
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to get all custom currencies',
    })
  }
}

export const createCustomCurrency = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { code, symbol, name, exchangeRate, isActive } = request.body as {
      code?: string
      symbol?: string
      name?: string
      exchangeRate?: number
      isActive?: boolean
    }

    if (!code || !symbol) {
      return reply.code(400).send({
        success: false,
        message: 'Currency code and symbol are required',
      })
    }

    // 检查货币代码是否已存在
    const existing = await CustomCurrency.findOne({ where: { code: code.toUpperCase() } })
    if (existing) {
      return reply.code(400).send({
        success: false,
        message: 'Currency code already exists',
      })
    }

    // 检查是否与系统货币冲突
    const systemCurrencies = ['CNY', 'USD', 'HKD', 'BTC', 'EUR', 'JPY', 'GBP', 'TWD', 'KRW', 'AUD', 'CAD', 'SGD', 'CHF']
    if (systemCurrencies.includes(code.toUpperCase())) {
      return reply.code(400).send({
        success: false,
        message: 'Currency code conflicts with system currency',
      })
    }

    const currency = await CustomCurrency.create({
      code: code.toUpperCase(),
      symbol: symbol,
      name: name || '',
      exchangeRate: exchangeRate || 1,
      isActive: isActive !== undefined ? isActive : true,
    })

    return {
      success: true,
      data: currency,
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to create custom currency',
    })
  }
}

export const updateCustomCurrency = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string }
    const { code, symbol, name, exchangeRate, isActive } = request.body as {
      code?: string
      symbol?: string
      name?: string
      exchangeRate?: number
      isActive?: boolean
    }

    const currency = await CustomCurrency.findByPk(id)
    if (!currency) {
      return reply.code(404).send({
        success: false,
        message: 'Custom currency not found',
      })
    }

    // 如果更新代码，检查是否冲突
    if (code && code.toUpperCase() !== currency.code) {
      const existing = await CustomCurrency.findOne({
        where: { code: code.toUpperCase() },
      })
      if (existing) {
        return reply.code(400).send({
          success: false,
          message: 'Currency code already exists',
        })
      }

      const systemCurrencies = ['CNY', 'USD', 'HKD', 'BTC', 'EUR', 'JPY', 'GBP', 'TWD', 'KRW', 'AUD', 'CAD', 'SGD', 'CHF']
      if (systemCurrencies.includes(code.toUpperCase())) {
        return reply.code(400).send({
          success: false,
          message: 'Currency code conflicts with system currency',
        })
      }
    }

    const updateData: any = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (symbol !== undefined) updateData.symbol = symbol
    if (name !== undefined) updateData.name = name
    if (exchangeRate !== undefined) updateData.exchangeRate = exchangeRate
    if (isActive !== undefined) updateData.isActive = isActive

    await currency.update(updateData)

    return {
      success: true,
      data: currency,
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to update custom currency',
    })
  }
}

export const deleteCustomCurrency = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string }

    const currency = await CustomCurrency.findByPk(id)
    if (!currency) {
      return reply.code(404).send({
        success: false,
        message: 'Custom currency not found',
      })
    }

    await currency.destroy()

    return {
      success: true,
      message: 'Custom currency deleted successfully',
    }
  } catch (error: any) {
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to delete custom currency',
    })
  }
}

