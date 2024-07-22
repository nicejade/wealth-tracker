import { get } from '../controllers/records'

export default [
  {
    method: 'GET',
    url: '/api/records',
    handler: get,
  },
]
