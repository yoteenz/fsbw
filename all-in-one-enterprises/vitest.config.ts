import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const isLiveSupabaseTest = process.env.AIO_LIVE_SUPABASE_TEST === '1';

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
    env: isLiveSupabaseTest
      ? {
          VITE_AIO_DATA_MODE: process.env.VITE_AIO_DATA_MODE ?? 'supabase',
          VITE_AIO_SUPABASE_URL: process.env.VITE_AIO_SUPABASE_URL ?? process.env.AIO_STAGING_SUPABASE_URL ?? '',
          VITE_AIO_SUPABASE_ANON_KEY:
            process.env.VITE_AIO_SUPABASE_ANON_KEY ?? process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? '',
        }
      : {
          // Unit tests always demo. Live Supabase validation sets AIO_LIVE_SUPABASE_TEST=1 in CI.
          VITE_AIO_DATA_MODE: 'demo',
          VITE_AIO_SUPABASE_URL: '',
          VITE_AIO_SUPABASE_ANON_KEY: '',
        },
  },
});
