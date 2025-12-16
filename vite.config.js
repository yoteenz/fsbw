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
        host: true, // This is equivalent to '0.0.0.0' but more reliable
        open: false,
        strictPort: false,
        hmr: {
            clientPort: 3001,
        },
    },
    logLevel: 'info',
    clearScreen: false,
});
