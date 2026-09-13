
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'e-VeriMet Legal Metrology Portal',
          short_name: 'e-VeriMet',
          description: 'Legal Metrology verification and certification portal.',
          theme_color: '#0c2340',
          background_color: '#f7f9ff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, '.'),
      },
    },
    server: {
      host: true,
      allowedHosts: true as any,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      // Express hosts the application server; do not create a separate
      // Vite WebSocket listener in the embedded middleware.
      hmr: false,
      ws: false as const,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.VITE_MIDDLEWARE_MODE === 'true' || process.env.DISABLE_HMR === 'true'
        ? null
        : {},
    },
    build: {
      chunkSizeWarningLimit: 2500,
    },
  };
});
