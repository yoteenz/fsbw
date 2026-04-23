import { defineConfig } from 'vite';

/** Standalone admin globe — deploy as its own Vercel project (root = embed/admin-globe). */
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'globe-vendor': ['three', 'globe.gl'],
        },
      },
    },
  },
  server: {
    port: 3010,
    host: '0.0.0.0',
  },
});
