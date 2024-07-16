import { create, update, getAssets, destroy } from '../controllers/assets'
import { getRecords } from '../controllers/record'

export const routes = [
  {
    method: 'GET',
    url: '/api/heart',
    handler: (_, reply) => {
      reply.send({ hello: 'world ! 🎉' })
    },
  },
  {
    method: 'POST',
    url: '/api/create',
    handler: create,
  },
  {
    method: 'POST',
    url: '/api/update',
    handler: update,
  },
  {
    method: 'POST',
    url: '/api/destroy',
    handler: destroy,
  },
  {
    method: 'GET',
    url: '/api/getAssets',
    handler: getAssets,
  },
  {
    method: 'GET',
    url: '/api/getRecords',
    handler: getRecords,
  },
]
