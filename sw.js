const cacheName = 'baca-yasindd-v1';
const assets = [
  '/',
  '/index.html',
  '/yasin.js',
  '/yas.js',
  '/yasin.json',
  '/font/bazzi-v7-full.woff2',
  '/images/192x192.png',
  '/images/512x512.png',
  '/images/16.png',
  '/images/32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets).catch(err => {
        console.error('Failed to cache', err);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(err => {
      console.error('Fetch failed', err);
      throw err;
    })
  );
});
