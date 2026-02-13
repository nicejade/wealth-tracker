import { FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { checkPassword } from '../controllers/password'

const whiteList = ['/api/heart', '/api/password/check', '/api/password/verify']

export default fp(async (fastify) => {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.url.startsWith('/api/')) return

    // 允许 GET 请求访问用户设置（读取不需要密码）
    if (request.url === '/api/user-settings' && request.method === 'GET') {
      return
    }

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
