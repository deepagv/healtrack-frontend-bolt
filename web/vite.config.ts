import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite plugin to rewrite imports like "@radix-ui/react-tabs@1.1.3" -> "@radix-ui/react-tabs"
function fixVersionedImports() {
  return {
    name: 'fix-versioned-imports',
    enforce: 'pre' as const,
    resolveId(this: any, source: string, importer: string | undefined) {
      let fixed = source
        // strip "@<version>" at the end of Radix React package specifiers
        .replace(/(@radix-ui\/react-[^@'"]+)@\d[\w.\-]*/g, '$1')
        // (optional) if any other packages come through with "@<version>", remove it here too
        .replace(/(lucide-react)@\d[\w.\-]*/g, '$1')

      if (fixed !== source) {
        return this.resolve(fixed, importer, { skipSelf: true })
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [react(), fixVersionedImports()],
  resolve: {
    alias: {
      // lets you import from the design export without moving it
      '@design': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    // allow Vite to read files from the repo root (../src)
    fs: { allow: ['..'] },
    port: 5173,
  },
})
