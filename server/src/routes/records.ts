import { get, update, destroy } from '../controllers/records'

export default [
  {
    method: 'GET',
    url: '/api/records',
    handler: get,
  },
  {
    method: 'POST',
    url: '/api/records',
    handler: update,
  },
  {
    method: 'DELETE',
    url: '/api/records',
    handler: destroy,
  },
]
