const CACHE_NAME = 'engly-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache only local assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).catch(err => {
      console.log('SW cache install error:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external resources (CDN)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    return; // Let browser handle CDN requests
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }).catch(err => {
      console.log('SW fetch error:', err);
    })
  );
});
