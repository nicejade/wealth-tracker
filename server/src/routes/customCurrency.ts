import {
  getCustomCurrencies,
  getAllCustomCurrencies,
  createCustomCurrency,
  updateCustomCurrency,
  deleteCustomCurrency,
} from '../controllers/customCurrency'

export default [
  {
    method: 'GET',
    url: '/api/currencies',
    handler: getCustomCurrencies,
  },
  {
    method: 'GET',
    url: '/api/currencies/all',
    handler: getAllCustomCurrencies,
  },
  {
    method: 'POST',
    url: '/api/currencies',
    handler: createCustomCurrency,
  },
  {
    method: 'PUT',
    url: '/api/currencies/:id',
    handler: updateCustomCurrency,
  },
  {
    method: 'DELETE',
    url: '/api/currencies/:id',
    handler: deleteCustomCurrency,
  },
]
