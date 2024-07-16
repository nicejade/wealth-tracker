import { resolve } from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    createSvgIconsPlugin({
      // 用于指定 SVG 图标所在的文件夹路径
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      // 生成的 symbol id 的格式
      symbolId: 'icon-[name]',
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://0.0.0.0:8888/',
    },
  },
  build: {
    outDir: '../server/public',
  },
})
