import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/physics-platform/',
  plugins: [
    react(),
    VitePWA({
      // 'prompt' keeps a newly downloaded version waiting until the app decides
      // it is safe to switch (see src/core/pwaUpdate.ts and UpdateManager), so a
      // student is never reloaded mid-quiz. 'autoUpdate' would activate the new
      // worker but leave the open page running old code until a manual reload.
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'PhysicsLab Interactive',
        short_name: 'PhysicsLab',
        description: 'Interactive Physics Learning Platform',
        theme_color: '#f6f7fb',
        background_color: '#f6f7fb',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
