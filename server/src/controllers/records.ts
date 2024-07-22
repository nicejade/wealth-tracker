import { Record } from '../models/records'

export const get = async (_, reply) => {
  try {
    const data = await Record.findAll()
    return reply.send(data)
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}
