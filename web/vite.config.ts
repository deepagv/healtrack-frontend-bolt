import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Strip "@<version>" from bare imports like "@radix-ui/react-tabs@1.1.3"
function fixVersionedImports() {
  return {
    name: 'fix-versioned-imports',
    enforce: 'pre' as const,
    resolveId(this: any, source: string, importer?: string) {
      const fixed = source
        .replace(/(@radix-ui\/react-[^@'"]+)@\d[\w.\-]*/g, '$1')
        .replace(/(lucide-react)@\d[\w.\-]*/g, '$1')
      if (fixed !== source) return this.resolve(fixed, importer, { skipSelf: true })
      return null
    },
  }
}

export default defineConfig({
  plugins: [react(), fixVersionedImports()],
  resolve: {
    // Extra safety: regex aliases that also strip versions if they slip through
    alias: [
      { find: /(@radix-ui\/react-[^@'"]+)@\d[\w.\-]*/, replacement: '$1' },
      { find: /(lucide-react)@\d[\w.\-]*/, replacement: '$1' },
      // Main alias to your design export (leave this as-is)
      { find: '@design', replacement: path.resolve(__dirname, '../src') },
    ],
  },
  server: {
    port: 5173,
    // Allow importing files from the parent folder (../src)
    fs: { allow: ['..'] },
  },
})
