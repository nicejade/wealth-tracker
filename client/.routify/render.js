
        import * as module from '../src/App.svelte'
        import { renderModule } from '@roxi/routify/tools/ssr4.js'
        import { map } from './route-map.js'

        export const render = url => renderModule(module, { url, routesMap: map })