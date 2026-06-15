/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the built site works from any
// GitHub Pages sub-path (project pages) without extra config.
// Vitest config lives under `test` (typed via the triple-slash reference above).
export default defineConfig({
  base: './',
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
