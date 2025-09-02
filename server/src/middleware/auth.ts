import { FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { checkPassword } from '../controllers/password'

const whiteList = ['/api/heart', '/api/password/check', '/api/password/verify', '/api/password/set']

export default fp(async (fastify) => {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.url.startsWith('/api/')) return

    if (whiteList.includes(request.url)) return

    const { needPassword } = await checkPassword(request)
    if (needPassword) {
      reply.code(401).send({
        success: false,
        message: 'You need to enter the password first to obtain the permission.',
      })
    }
  })
})
