import { defineConfig } from 'vite'

export default defineConfig({
  // Configuração para servir arquivos HTML diretamente
  root: 'public',
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  publicDir: 'public'
})
