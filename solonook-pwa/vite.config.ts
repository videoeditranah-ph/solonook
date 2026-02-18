import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// TIP: For GitHub Pages, set base to '/<repo-name>/'.
// Example: base: '/solonook-pwa/'
export default defineConfig({
  base: '/solonook/',
  plugins: [
    ...
  ]
});
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'SoloNook Library',
        short_name: 'SoloNook',
        description: 'Offline-first library + reader + writing nook for PDFs and EPUBs.',
        theme_color: '#111827',
        background_color: '#0b1020',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // App shell only; documents are stored locally via OPFS/IndexedDB.
        navigateFallback: '/index.html'
      }
    })
  ]
});
