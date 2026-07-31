import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Proxy ใช้เฉพาะ local dev เท่านั้น
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  // ไม่ต้องใส่ define — Vite จัดการ VITE_* env vars เองอัตโนมัติ
});
