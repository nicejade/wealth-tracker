import { Router, createRouter } from '@roxi/routify'
import routes from './routes.default.js'

// remove previous routers to avoid bumping router names (/path => /1/path)
globalThis.__routify.reset()
export const router = createRouter({routes})
export { Router, routes }
