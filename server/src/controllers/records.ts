import { Record } from '../models/records'

export const get = async (request, reply) => {
  try {
    const { size = 10, page = 1 } = request.query
    const limit = parseInt(size as string, 10)
    const offset = (parseInt(page as string, 10) - 1) * limit

    const { count, rows: data } = await Record.findAndCountAll({
      limit,
      offset,
      order: [['created', 'DESC']],
    })

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
  try {
    const params = request?.body
    const options = {
      id: params.id,
      type: params.type,
      amount: params.amount,
      currency: params.currency,
      note: params.note,
      datetime: params.datetime,
      created: new Date(),
      risk: params.risk,
      liquidity: params.liquidity,
    }
    const data = await Record.update(options, {
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
  try {
    const { id = '' } = request?.body
    const data = await Record.destroy({
      where: { id },
    })
    return reply.send(data)
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}
