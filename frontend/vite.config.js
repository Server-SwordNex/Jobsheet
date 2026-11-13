import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // The desktop (Electron) app loads index.html from disk, so it needs relative paths.
  // On the web, assets must be absolute: with './' a deep address such as
  // /superadmin/login asks for /superadmin/assets/... and the page stays blank.
  base: mode === 'electron' ? './' : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-print'
            }
            return 'vendor'
          }
        },
      },
    },
  },
}))
