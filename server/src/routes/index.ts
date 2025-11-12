import assets from './assets'
import records from './records'
import advice from './advice'
import insights from './insights'
import password from './password'
import userSettings from './userSettings'
import customCurrency from './customCurrency'
import { Assets } from './../models/assets'
import { Record } from './../models/records'

export const reset = async (_, reply) => {
  const canBeReset = process.env.CAN_BE_RESET || false
  if (!canBeReset) {
    return reply.code(400).send({
      statusCode: 400,
      message: 'The database can not be reset.',
    })
  }
  try {
    await Assets.destroy({ where: {} })
    await Record.destroy({ where: {} })

    return reply.send({
      success: true,
      message: 'The database has been reset.',
    })
  } catch (error: any) {
    return reply.code(400).send({
      statusCode: 400,
      message: error.message,
    })
  }
}

const routes = [
  {
    method: 'GET',
    url: '/api/heart',
    handler: (_, reply) => {
      reply.send({ hello: 'world ! 🎉' })
    },
  },
  {
    method: 'POST',
    url: '/api/reset',
    handler: reset,
  },
]

export default [
  ...routes,
  ...assets,
  ...records,
  ...advice,
  ...insights,
  ...password,
  ...userSettings,
  ...customCurrency,
]
