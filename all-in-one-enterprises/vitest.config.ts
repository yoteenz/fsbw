import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/readiness/**/*.test.ts'],
    env: {
      // Unit tests always demo. Live Supabase validation uses dedicated Live/Integration test files.
      VITE_AIO_DATA_MODE: 'demo',
      VITE_AIO_SUPABASE_URL: '',
      VITE_AIO_SUPABASE_ANON_KEY: '',
    },
  },
});
