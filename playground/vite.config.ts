import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const here = fileURLToPath(new URL('.', import.meta.url))
// pnpm workspace root (client/)
const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url))

export default defineConfig({
  root: here,
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      treeshake: {
        // @react95/* ships no `sideEffects: false`, so Rollup otherwise keeps
        // every icon/component module (and its CSS). Prune pure-JS modules but
        // keep `.css`/`.css.mjs` so component styles still load.
        moduleSideEffects(id) {
          if (id.includes('@react95/')) return id.includes('.css')
          return true
        },
      },
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow serving sources of the linked workspace packages.
      allow: [workspaceRoot],
    },
  },
  optimizeDeps: {
    // Workspace packages are consumed as raw TypeScript sources.
    exclude: [
      '@owdproject/core',
      '@owdproject/react',
      '@owdproject/react-kit-react95',
      '@owdproject/react-theme-win95',
    ],
  },
})
