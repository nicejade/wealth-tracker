import { FastifyRequest } from 'fastify'
import { checkPassword, verifyPassword, setPassword } from '../controllers/password'

export default [
  {
    method: 'GET',
    url: '/api/password/check',
    handler: async (request: FastifyRequest) => {
      return checkPassword(request)
    },
  },
  {
    method: 'POST',
    url: '/api/password/verify',
    handler: verifyPassword,
  },
  {
    method: 'POST',
    url: '/api/password/set',
    handler: setPassword,
  },
]
