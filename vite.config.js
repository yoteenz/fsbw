import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        port: 3001,
        host: '0.0.0.0',
        open: true,
        strictPort: true,
        hmr: {
            host: '0.0.0.0',
        },
    },
});
