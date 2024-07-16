export default async (fastify) => {
  const rateLimitOptions = {
    max: 10,
    ban: 10,
    timeWindow: 1000 * 60 * 60 * 24,
    hook: 'preHandler',
    keyGenerator: (request) => {
      console.log(`request.headers：`, request.headers)
      return request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.ip
    },
  }

  return await fastify
    .register(import('@fastify/helmet'), { global: true })
    .register(import('@fastify/cookie'))
    .register(import('@fastify/rate-limit'), rateLimitOptions)
    .register(import('fastify-xml-body-parser'))
    .register(require('@fastify/multipart'))
    .ready((err) => {
      if (err) console.log(`Something Error @Start：${err}`)
      console.log('万事俱备，风起云涌。')
    })
}
