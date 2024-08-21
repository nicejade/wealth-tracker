import Fastify from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import fastifyStatic from '@fastify/static'
import * as dotenv from 'dotenv'
// Fix Bug: [fetch is not defined](Ubuntu16 Cannot Upgrade Node to v18.*)
import 'isomorphic-fetch'
import * as register from './register'
import routes from './routes'
import { sequelize } from './models/index'

dotenv.config()

const fastify = Fastify({
  logger: true,
})

const connect2sqlite = () => {
  sequelize
    .sync()
    .then(() => {
      console.log('🎊 Database synced!')
    })
    .catch((err) => {
      console.error('Failed to sync database:', err)
    })
}

const start = async () => {
  try {
    connect2sqlite()

    // register routes
    routes.forEach((route: any) => fastify.route(route))

    fastify.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'public'),
      prefix: '',
    })

    await register.default(fastify)

    // 判断请求不包含 /api/，则返回 public/index.html
    fastify.setNotFoundHandler(async (request, reply) => {
      const indexHtmlContent = await fs.readFile(
        path.join(__dirname, '..', 'public', 'index.html'),
        'utf-8',
      )
      if (!request.url.includes('/api/')) {
        reply.type('text/html').send(indexHtmlContent)
      } else {
        reply.code(404).send({ error: 'Oops , Page Not Found.' })
      }
    })

    const address = await fastify.listen({
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8888,
      host: '0.0.0.0',
    })
    fastify.log.info(`server listening on ${address}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
