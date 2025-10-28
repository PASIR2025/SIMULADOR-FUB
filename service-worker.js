const CACHE_NAME = 'logicsoft-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
  // Nota: tus iconos ya existentes se cachearán bajo demanda,
  // o puedes listarlos aquí si conoces sus nombres exactos.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Estrategia: cache-first para GET, passthrough para otras
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => cached || Response.error());
    })
  );
});