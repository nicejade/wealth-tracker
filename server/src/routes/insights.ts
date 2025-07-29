import { create, get, update, destroy, getCalendarData } from '../controllers/insights'

export default [
  {
    method: 'POST',
    url: '/api/insights',
    handler: create,
  },
  {
    method: 'GET',
    url: '/api/insights',
    handler: get,
  },
  {
    method: 'PUT',
    url: '/api/insights',
    handler: update,
  },
  {
    method: 'DELETE',
    url: '/api/insights',
    handler: destroy,
  },
  {
    method: 'GET',
    url: '/api/insights/calendar',
    handler: getCalendarData,
  },
]
