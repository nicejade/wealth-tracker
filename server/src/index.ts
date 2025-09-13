import fs from 'fs/promises'
import path from 'path'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
// Fix Bug: [fetch is not defined](Ubuntu16 Cannot Upgrade Node to v18.*)
import 'isomorphic-fetch'
import * as register from './register'
import routes from './routes'
import { sequelize } from './models/index'

const fastify = Fastify({ logger: true })

const connect2sqlite = async () => {
  try {
    // 首先尝试正常同步；检查并添加 tags 列（如果不存在）；如果存在，则不添加；
    await sequelize.sync()
    await addTagsColumnToAssetsIfNotExists()
    await addTagsColumnToRecordIfNotExists()

    console.log('🎊 Database synced!')
  } catch (err) {
    console.error('Failed to sync database:', err)
    throw err
  }
}

const addTagsColumnToAssetsIfNotExists = async () => {
  try {
    const [results] = await sequelize.query('PRAGMA table_info(assets)')
    const hasTagsColumn = results.some((row: any) => row.name === 'tags')

    if (!hasTagsColumn) {
      console.log('Adding tags column to assets table...')
      await sequelize.query("ALTER TABLE assets ADD COLUMN tags TEXT DEFAULT ''")
      console.log('✅ Tags column added successfully!')
    }
  } catch (err) {
    console.error('Error adding tags column:', err)
  }
}

const addTagsColumnToRecordIfNotExists = async () => {
  try {
    const [results] = await sequelize.query('PRAGMA table_info(record)')
    const hasTagsColumn = results.some((row: any) => row.name === 'tags')

    if (!hasTagsColumn) {
      console.log('Adding tags column to record table...')
      await sequelize.query("ALTER TABLE record ADD COLUMN tags TEXT DEFAULT ''")
      console.log('✅ Tags column added to record table successfully!')
    }
  } catch (err) {
    console.error('Error adding tags column to record table:', err)
  }
}

const setupStaticFiles = () => {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '',
  })
}

const setupNotFoundHandler = () => {
  fastify.setNotFoundHandler(async (request, reply) => {
    if (!request.url.includes('/api/')) {
      const indexHtmlContent = await fs.readFile(
        path.join(__dirname, '..', 'public', 'index.html'),
        'utf-8',
      )
      reply.type('text/html').send(indexHtmlContent)
    } else {
      reply.code(404).send({ error: 'Oops , Page Not Found.' })
    }
  })
}

const setupApiRoutes = () => {
  routes.forEach((route: any) => fastify.route(route))
}

const start = async () => {
  try {
    await Promise.all([
      connect2sqlite(),
      register.default(fastify),
      setupApiRoutes(),
      setupStaticFiles(),
      setupNotFoundHandler(),
    ])

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8888
    const address = await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`server listening on ${address}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
