import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@design': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    cors: true,
  },
  optimizeDeps: {
    include: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-slot',
      '@radix-ui/react-progress',
      'class-variance-authority',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      '@supabase/supabase-js',
      '@radix-ui/react-label',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-switch',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-separator',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-popover',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-accordion',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-menubar',
      'react-hook-form',
      'vaul',
      'cmdk',
      'react-day-picker',
      'embla-carousel-react',
      'input-otp',
      'react-resizable-panels',
      'sonner',
      'next-themes'
    ]
  }
})