import { getUserSettings, updateUserSettings } from '../controllers/userSettings'

export default [
  {
    method: 'GET',
    url: '/api/settings',
    handler: getUserSettings,
  },
  {
    method: 'PUT',
    url: '/api/settings',
    handler: updateUserSettings,
  },
]
