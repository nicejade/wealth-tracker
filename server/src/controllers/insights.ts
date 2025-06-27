import { Insight } from '../models/insights'

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
    const { size = 0, page = 1 } = request.query
    const limit: number = parseInt(size as string, 10)
    const offset: number = (parseInt(page as string, 10) - 1) * limit

    let queryOptions = {
      order: [['created', 'DESC']] as [string, string][],
    }

    if (limit > 0) {
      queryOptions = {
        ...queryOptions,
        limit: limit,
        offset: offset,
      } as { order: [string, string][]; limit: number; offset: number }
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
