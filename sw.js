const cacheName = 'baca-yasindd-v1';
const assets = [
  '/',
  '/index.html',
  '/data/yasin.js',
  '/data/yas.js',
  '/data/yasin.json',
  '/font/bazzi-v7-full.woff2',
  '/images/192x192.png',
  '/images/512x512.png',
  '/images/16.png',
  '/images/32.png',
  '/audio/036001.mp3',
'/audio/036002.mp3',
'/audio/036003.mp3',
'/audio/036004.mp3',
'/audio/036005.mp3',
'/audio/036006.mp3',
'/audio/036007.mp3',
'/audio/036008.mp3',
'/audio/036009.mp3',
'/audio/036010.mp3',
'/audio/036011.mp3',
'/audio/036012.mp3',
'/audio/036013.mp3',
'/audio/036014.mp3',
'/audio/036015.mp3',
'/audio/036016.mp3',
'/audio/036017.mp3',
'/audio/036018.mp3',
'/audio/036019.mp3',
'/audio/036020.mp3',
'/audio/036021.mp3',
'/audio/036022.mp3',
'/audio/036023.mp3',
'/audio/036024.mp3',
'/audio/036025.mp3',
'/audio/036026.mp3',
'/audio/036027.mp3',
'/audio/036028.mp3',
'/audio/036029.mp3',
'/audio/036030.mp3',
'/audio/036031.mp3',
'/audio/036032.mp3',
'/audio/036033.mp3',
'/audio/036034.mp3',
'/audio/036035.mp3',
'/audio/036036.mp3',
'/audio/036037.mp3',
'/audio/036038.mp3',
'/audio/036039.mp3',
'/audio/036040.mp3',
'/audio/036041.mp3',
'/audio/036042.mp3',
'/audio/036043.mp3',
'/audio/036044.mp3',
'/audio/036045.mp3',
'/audio/036046.mp3',
'/audio/036047.mp3',
'/audio/036048.mp3',
'/audio/036049.mp3',
'/audio/036050.mp3',
'/audio/036051.mp3',
'/audio/036052.mp3',
'/audio/036053.mp3',
'/audio/036054.mp3',
'/audio/036055.mp3',
'/audio/036056.mp3',
'/audio/036057.mp3',
'/audio/036058.mp3',
'/audio/036059.mp3',
'/audio/036060.mp3',
'/audio/036061.mp3',
'/audio/036062.mp3',
'/audio/036063.mp3',
'/audio/036064.mp3',
'/audio/036065.mp3',
'/audio/036066.mp3',
'/audio/036067.mp3',
'/audio/036068.mp3',
'/audio/036069.mp3',
'/audio/036070.mp3',
'/audio/036071.mp3',
'/audio/036072.mp3',
'/audio/036073.mp3',
'/audio/036074.mp3',
'/audio/036075.mp3',
'/audio/036076.mp3',
'/audio/036077.mp3',
'/audio/036078.mp3',
'/audio/036079.mp3',
'/audio/036080.mp3',
'/audio/036081.mp3',
'/audio/036082.mp3',
'/audio/036083.mp3'

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
