// service-worker.js — simple precache + runtime cache
const CACHE_NAME = 'simupasir-cache-v1';
const PRECACHE_URLS = [
  '/', '/index.html', '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-icon-512.png'
  // Si añades archivos .css o .js separados, añádelos aquí por ejemplo '/styles.css', '/app.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Always try network for navigation requests, fallback to cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other GET requests: try cache first, then network and put into cache
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          // Only cache same-origin responses
          if (req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        }).catch(() => {
          // fallback for images
          if (req.destination === 'image') return caches.match('/icons/icon-192.png');
        });
      })
    );
  }
});
