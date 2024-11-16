import { generateAdvice } from './../controllers/advice'

export default [
  {
    method: 'POST',
    url: '/api/generate-advice',
    handler: generateAdvice,
  },
]
