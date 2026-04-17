import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: './',
  server: {
    // 关键：添加允许访问的主机，解决 Blocked request 报错
    allowedHosts: [
      '8aebc31672064ca68120bc1ade9c5d22--5173.ap-shanghai2.cloudstudio.club',
      '.cloudstudio.club' // 通配符，允许该域名下所有子域名访问
    ],
    // 同时保持 --host 配置，确保服务对外暴露
    host: '0.0.0.0',
    // ✅ 关键修复：配置代理，将 /api 请求转发到后端服务
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true
      }
    }
  }
})
