/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' uses absolute asset paths. The site lives at the root of the custom
// domain (wardsandboards.com), and client-side routes like /learn/<case> need
// absolute /assets/ URLs so a deep-linked page loads its scripts. The build
// script also copies index.html -> 404.html so Pages serves the app shell for
// those routes. Vitest config lives under `test` (typed via the reference above).
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Multi-page: the SPA plus standalone, crawlable /privacy.html and /terms.html.
      // Relative paths are resolved against the Vite project root.
      input: {
        main: 'index.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
