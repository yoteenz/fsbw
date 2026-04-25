import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Standalone admin globe — deploy as its own Vercel project (root = embed/admin-globe). */
export default defineConfig({
  resolve: {
    alias: {
      /** Shared with main app — same land sampling for SVG + WebGL. */
      '@fsbw/adminGlobeNe110mLand': path.resolve(__dirname, '../../src/utils/adminGlobeNe110mLand.ts'),
      '@fsbw/adminGlobeBoundaryPaths': path.resolve(__dirname, '../../src/utils/adminGlobeBoundaryPaths.ts'),
      '@fsbw/adminGlobePlaceLabel': path.resolve(__dirname, '../../src/utils/adminGlobePlaceLabel.ts'),
    },
  },
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
