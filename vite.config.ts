/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the built site works from any
// GitHub Pages sub-path (project pages) without extra config.
// Vitest config lives under `test` (typed via the triple-slash reference above).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
