/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset paths so the build works under any sub-path (e.g. GitHub Pages /my-projects/).
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
