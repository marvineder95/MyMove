import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Alias @ zeigt auf das src-Verzeichnis für einfachere Imports
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    // Entwicklungsserver läuft auf Port 5173
    port: 5173,
    // Automatisch öffnen im Browser
    open: true
  },
  build: {
    // Ausgabeverzeichnis für Produktionsbuild
    outDir: 'dist',
    // Sourcemaps für Debugging
    sourcemap: true
  }
})
