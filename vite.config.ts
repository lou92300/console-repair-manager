import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    open: true
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['jsonwebtoken', 'bcryptjs', 'nodemailer', 'express', 'cors', 'helmet']
  },
  build: {
    rollupOptions: {
      external: ['jsonwebtoken', 'bcryptjs', 'nodemailer', 'express', 'cors', 'helmet']
    }
  }
})
