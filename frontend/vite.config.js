import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 هذا السطر هو الحل السحري للشاشة البيضاء في الأندرويد والمحلي
  server: {
    port: 3000,
    host: true, // 👈 لفتح السيرفر على شبكة الهاتف تلقائياً
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
