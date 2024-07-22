import assets from './assets'
import records from './records'

const routes = [
  {
    method: 'GET',
    url: '/api/heart',
    handler: (_, reply) => {
      reply.send({ hello: 'world ! 🎉' })
    },
  },
]

export default [...routes, ...assets, ...records]
