#!/usr/bin/env node
import { generateSW } from 'workbox-build'
import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const clientDist = resolve('.tanstack/start/build/client-dist')
const outputPublic = resolve('.output/public')

async function buildSW() {
  console.log('[workbox] generating service worker from', clientDist)
  const { count, size, warnings, filePaths } = await generateSW({
    globDirectory: clientDist,
    globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
    globIgnores: ['sw.js', 'workbox-*.js'],
    swDest: resolve(clientDist, 'sw.js'),
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images',
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\/api\/.*$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  })

  warnings.forEach(w => console.warn('[workbox warning]', w))
  console.log(`[workbox] precached ${count} files, total size ${(size/1024).toFixed(2)} KiB`)

  if (!existsSync(outputPublic)) mkdirSync(outputPublic, { recursive: true })
  copyFileSync(resolve(clientDist, 'sw.js'), resolve(outputPublic, 'sw.js'))
  console.log('[workbox] copied sw.js to .output/public')
}

buildSW().catch(e => { console.error(e); process.exit(1) })
