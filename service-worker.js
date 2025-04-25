// Service worker for cache busting
const CACHE_VERSION = 'v1.1-' + new Date().getTime();
const CACHE_NAME = `joydeep-portfolio-${CACHE_VERSION}`;

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/main.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('joydeep-portfolio-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Bypass Google Analytics requests
  if (url.hostname === 'www.google-analytics.com' || url.hostname === 'www.googletagmanager.com') {
    return fetch(event.request);
  }

  // Existing caching strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
