import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // el nginx de Lerd corre en un contenedor y no alcanza 127.0.0.1
    port: 5173,
    strictPort: true,
    allowedHosts: ['qabit-tareas.test'],
    proxy: {
      // /api/* -> Express (3001); el navegador solo habla con un origen
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
