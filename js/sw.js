// ===== SERVICE WORKER - OFFLINE SUPPORT =====
const CACHE_NAME = 'kalktrainer-v7';

// Use relative paths from the root
const ASSETS = [
  './',
  './index.html',
  './home.html',
  './ergebnis.html',
  './profil.html',
  './kurs.html',
  './css/style.css',
  './js/storage.js',
  './js/profanity.js',
  './js/profiles.js',
  './js/generator.js',
  './manifest.json',
  './icons/icon.svg'
];

// Install - Cache alle Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets...');
        // Cache assets one by one to avoid failures
        return Promise.allSettled(
          ASSETS.map(url => 
            cache.add(url).catch(err => console.warn('Cache failed for:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - Alte Caches loeschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Return index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
