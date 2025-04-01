
import { appInstance, preloadUrl } from '@roxi/routify'
import { map } from './route-map.js'

appInstance.routeMaps = map

// We need to import the App module since a router is likely declared here. This saves us pre-creating the router in the preload step below.
import * as module from '../src/App.svelte'

const preloadPromise = Promise.all([
    module.load?.(),
    // PreloadUrl parses the url and preloads each url chunk in a router that matches its name. So for '/hello;widget=/world',
    // it will preload '/hello' in the default router and '/world' in the 'widget' router.
    // If the respective routers don't exist, preloadUrl will use routesMap to pre-create a router and match it with the url chunk.
    preloadUrl({ routesMap: map })
])

export const app = preloadPromise.then(() => import('../src/main.js'))
