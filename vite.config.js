import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function swCacheBust() {
  return {
    name: 'sw-cache-bust',
    closeBundle() {
      const swPath = path.resolve('dist/sw.js');
      if (!fs.existsSync(swPath)) return;
      const buildId = Date.now().toString(36);
      const content = fs.readFileSync(swPath, 'utf-8');
      fs.writeFileSync(swPath, content.replace('__BUILD_ID__', buildId));
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), swCacheBust()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
