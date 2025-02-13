/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    exclude: ['e2e/**', '**/node_modules/**'],
    coverage: {
      reporter: ['text'],
      exclude: [
        'e2e/**',
        'src/graphql/**',
        'src/vite-env.d.ts',
        '**/node_modules/**',
        'codegen.ts',
        'eslint.config.js',
        'vite.config.ts',
        'dist/**',
      ],
      thresholds: {
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globals: true,
  },
});
