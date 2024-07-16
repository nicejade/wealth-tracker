import { Record } from './../models/record'

export const getRecords = async (_, reply) => {
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
