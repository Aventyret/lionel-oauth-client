import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    dir: './test/unit',
    globals: true,
    setupFiles: ['./test/unit/setup.ts']
  }
})
