import { Insight } from '../models/insights'
import { Op } from 'sequelize'

export const create = async (request, reply) => {
  const params = request?.body
  try {
    const options = {
      title: params.title,
      content: params.content,
      tags: params.tags || '',
      created: new Date(),
      updated: new Date(),
    }
    const insight = await Insight.create(options)
    return reply.send(insight)
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}

export const get = async (request, reply) => {
  try {
    const { size = 0, page = 1, startDate, endDate } = request.query
    const limit: number = parseInt(size as string, 10)
    const offset: number = (parseInt(page as string, 10) - 1) * limit

    let queryOptions: any = {
      order: [['created', 'DESC']] as [string, string][],
    }

    // 添加日期范围过滤
    if (startDate && endDate) {
      queryOptions.where = {
        created: {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        },
      }
    }

    if (limit > 0) {
      queryOptions = {
        ...queryOptions,
        limit: limit,
        offset: offset,
      }
    }

    const { count, rows: data } = await Insight.findAndCountAll(queryOptions)

    return reply.send({
      total: count,
      page: parseInt(page as string, 10),
      size: limit,
      data,
    })
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}

export const update = async (request, reply) => {
  const params = request?.body
  try {
    const options = {
      title: params.title,
      content: params.content,
      tags: params.tags || '',
      updated: new Date(),
    }
    const data = await Insight.update(options, {
      where: { id: params.id },
    })
    return reply.send(data)
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}

export const destroy = async (request, reply) => {
  const { id } = request?.body
  try {
    await Insight.destroy({ where: { id } })
    return reply.send({ result: true })
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}

// 获取日历热力图数据
export const getCalendarData = async (request, reply) => {
  try {
    const { startDate, endDate } = request.query

    if (!startDate || !endDate) {
      return reply.code(400).send({
        statusCode: 400,
        message: 'startDate and endDate are required',
      })
    }

    const start = new Date(startDate as string)
    const end = new Date(endDate as string)

    // 设置时间范围到一天的开始和结束
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const insights = await Insight.findAll({
      where: {
        created: {
          [Op.between]: [start, end],
        },
      },
      order: [['created', 'DESC']],
    })

    // 按日期分组统计
    const dateMap = new Map()

    insights.forEach((insight) => {
      const dateStr = insight.created.toISOString().split('T')[0]
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          count: 0,
          insights: [],
        })
      }
      const dayData = dateMap.get(dateStr)
      dayData.count++
      dayData.insights.push(insight)
    })

    // 转换为数组格式
    const calendarData = Array.from(dateMap.values())

    return reply.send(calendarData)
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}
