import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                // Use content-based hashing for better cache invalidation
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]',
                // Manual chunk splitting for better caching
                manualChunks: function (id) {
                    // Split vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('react-router')) {
                            return 'vendor-router';
                        }
                        return 'vendor';
                    }
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
    },
    server: {
        port: 3001,
        host: '0.0.0.0', // Explicitly bind to all interfaces for mobile access
        open: false,
        strictPort: true, // Force port 3001, don't fall back to other ports
        hmr: {
            host: 'localhost',
            clientPort: 3001,
        },
        // Ensure SPA routing works - all routes serve index.html
        middlewareMode: false,
    },
    logLevel: 'info',
    clearScreen: false,
});
