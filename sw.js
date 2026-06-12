const CACHE = 'eje-cafetero-v3';

// Solo cachear assets estáticos, NUNCA el index.html
const ASSETS = [
  '/AHORRO-PROGRAMADO/icon-192.png',
  '/AHORRO-PROGRAMADO/icon-512.png',
  '/AHORRO-PROGRAMADO/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Borrar TODOS los caches viejos
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // index.html SIEMPRE desde la red (nunca desde caché)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Firebase y otros recursos externos: siempre desde la red
  if (url.hostname.includes('firebase') || url.hostname.includes('gstatic')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Resto: caché primero
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
