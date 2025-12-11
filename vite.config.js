import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
