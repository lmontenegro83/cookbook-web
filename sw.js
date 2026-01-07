const CACHE_NAME = 'sous-vide-cookbook-v1';
const BASE = self.registration.scope;
const buildPath = path => new URL(path, BASE).pathname;
const ASSETS_TO_CACHE = [
  buildPath('./'),
  buildPath('index.html'),
  buildPath('recipes.json'),
  buildPath('manifest.json'),
  buildPath('assets/index-W82P3Hg4.js'),
  buildPath('assets/index-BZxvxeNz.css'),
  buildPath('images/hero-banner.jpg'),
  buildPath('images/food-showcase.jpg'),
  buildPath('images/pattern-accent.jpg')
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some assets failed to cache:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request).then(networkResponse => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // Cache successful responses for future use
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If network fails and we don't have a cached response,
        // return a basic offline page or cached fallback
        console.log('Offline - no cached response for:', event.request.url);
        return new Response('Offline - this content is not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});
