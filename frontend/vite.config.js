import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Vingo - Food Delivery',
        short_name: 'Vingo',
        description: 'Food delivery, restaurant discovery, and short-form food reels.',
        theme_color: '#ff4d2d',
        background_color: '#fff9f6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the built app shell/static assets only. API calls under
        // /api/* are intentionally left uncached (network-only) — order
        // status, cart, and auth must always be fresh, never served stale
        // from a service worker cache.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
      },
    }),
  ],
})
