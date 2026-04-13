const CACHE_NAME = 'wolf-tracker-v2'
const BASE = self.location.pathname.replace(/\/sw\.js$/, '')
const APP_SHELL = [`${BASE}/`, `${BASE}/index.html`, `${BASE}/manifest.webmanifest`, `${BASE}/favicon.svg`]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
      return response
    }).catch(() => caches.match(`${BASE}/index.html`)))
  )
})
