import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-icon-512.png'],
      manifest: {
        name: 'ArabicPT',
        short_name: 'ArabicPT',
        lang: 'ko-KR',
        description: '한국어 기반 아랍어 학습 PWA 서비스',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Spring OAuth는 브라우저 전체 이동이어야 함. 기본 navigateFallback(index.html)이
        // /oauth2, /login/oauth2 를 SPA로 돌려 빈 화면이 나는 것을 막는다.
        navigateFallbackDenylist: [/^\/oauth2/, /^\/login\/oauth2/, /^\/api/],
      },
    }),
  ],
})
