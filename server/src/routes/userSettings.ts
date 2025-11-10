import { getUserSettings, updateUserSettings } from '../controllers/userSettings'

export default [
  {
    method: 'GET',
    url: '/api/user-settings',
    handler: getUserSettings,
  },
  {
    method: 'PUT',
    url: '/api/user-settings',
    handler: updateUserSettings,
  },
]
