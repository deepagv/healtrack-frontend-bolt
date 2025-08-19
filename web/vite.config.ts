import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite config for the web app
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use components from the existing design export at ../src
      '@design': path.resolve(__dirname, '../src'),
    },
  },
})
