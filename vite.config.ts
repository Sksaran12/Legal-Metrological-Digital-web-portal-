
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));

  return {
    plugins: [react(), tailwindcss()],
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
