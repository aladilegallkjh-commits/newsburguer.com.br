const CACHE_NAME = 'newsburguer-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch pass-through for PWA installability requirements
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
