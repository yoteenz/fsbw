import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: {
      VITE_AIO_DATA_MODE: process.env.VITE_AIO_DATA_MODE ?? 'demo',
      VITE_AIO_SUPABASE_URL: process.env.VITE_AIO_SUPABASE_URL ?? process.env.AIO_STAGING_SUPABASE_URL ?? '',
      VITE_AIO_SUPABASE_ANON_KEY:
        process.env.VITE_AIO_SUPABASE_ANON_KEY ?? process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? '',
    },
  },
});
