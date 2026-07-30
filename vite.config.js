import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(
      process.env.VITE_SERVER_URL || 'http://localhost:3001'
    ),
  },
});
