var cacheName = 'news-v1';

var staticAssets = [
  './pwa/',
  './pwa/app.js',
  './pwa/styles.css',
  './pwa/fallback.json',
  './pwa/images/fetch-dog.jpg'
];


//Installing service worker
self.addEventListener('install', async function () {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
  console.log('Service Worker installed');
});


//Activating service worker
// event => {} is equivalent to function (event) {}
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  console.log('Service Worker activated');
});


//Fetching cache from service worker
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);	

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
  console.log('Service Worker fetch' , request.url);
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

//Dynamic caching as it stores caches for every page visit
async function networkFirst(request) {
  const dynamicCache = await caches.open('news-dynamic');
  try {
    const networkResponse = await fetch(request);
    dynamicCache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    const cachedResponse = await dynamicCache.match(request);
    return cachedResponse || await caches.match('./pwa/fallback.json');
  }
}