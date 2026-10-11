import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listens on all local IP addresses (0.0.0.0)
    port: 5173,
    allowedHosts: [
      'dxbigilaptop-8.igialmas.com'
    ],
    proxy: {
      '/api/hyperion': {
        target: 'https://www.lotusgemology.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/hyperion/, '')
      }
    }
  }
});
