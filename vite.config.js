import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_BASE ?? '/p15/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'docs'
  },
  server: {
    watch: {
      ignored: ['**/server/backups/**']
    },
    proxy: {
      '/api': {
        target: 'http://azterra.us-east-2.elasticbeanstalk.com',
        changeOrigin: true
      }
    }
  }
})
