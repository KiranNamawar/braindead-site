import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    reporter: 'dot',
    logLevel: 'error',
    silent: true,
    outputFile: undefined,
    hideSkippedTests: true,
    passWithNoTests: true,
    bail: 1,
  },
});