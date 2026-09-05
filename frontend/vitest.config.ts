import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      // Exclude config files, type definitions, and main entry points from coverage math
      exclude: [
        'node_modules/',
        'src/types/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '*.config.ts',
        '*.config.js'
      ]
    }
  },
});