import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const cloudMobilePreview =
  process.env.AIO_CLOUD_MOBILE_PREVIEW === '1' || process.env.AIO_CLOUD_MOBILE_PREVIEW === 'true';

const tunnelHostname = (
  process.env.AIO_CLOUDFLARE_TUNNEL_HOSTNAME ||
  process.env.CLOUDFLARE_TUNNEL_HOSTNAME ||
  ''
).trim();

let tunnelAllowedHost: string | undefined;
if (tunnelHostname) {
  try {
    tunnelAllowedHost = new URL(
      tunnelHostname.includes('://') ? tunnelHostname : `https://${tunnelHostname}`,
    ).hostname;
  } catch {
    tunnelAllowedHost = tunnelHostname.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function stripViteClientForCloudPreview() {
  return {
    name: 'aio-strip-vite-client-cloud-preview',
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        return html.replace(/\s*<script type="module" src="\/@vite\/client"><\/script>\s*/g, '\n');
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    ...(cloudMobilePreview ? [stripViteClientForCloudPreview()] : []),
  ],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: ['.trycloudflare.com', ...(tunnelAllowedHost ? [tunnelAllowedHost] : [])],
    hmr: cloudMobilePreview ? false : undefined,
  },
});
