// Service Worker — Cartera Negocios v2.0
const CACHE = 'cartera-v2';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Solo cachear la app (index.html), no las llamadas a Supabase
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Actualizar cache con versión nueva
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Notificar a los clientes cuando hay una versión nueva
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
