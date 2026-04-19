const CACHE_NAME = 'wu-tree-v1';
const ASSETS = [
  '/wu-tree/wu-tree-v2-home.html',
  '/wu-tree/wu-tree-v2-tasks.html',
  '/wu-tree/wu-tree-v2-domain.html',
  '/wu-tree/wu-tree-v2-activity.html',
  '/wu-tree/wu-tree-v2-objective.html',
  '/wu-tree/wu-tree-v2-visualization.html',
  '/wu-tree/wu-tree-v2-vision.html',
  '/wu-tree/wu-tree-v2-session.html',
  '/wu-tree/wu-tree-v2-progress.html',
  '/wu-tree/manifest.json',
  '/wu-tree/icon-192.png',
  '/wu-tree/icon-512.png'
];

// Install - cache assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Take control immediately
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Got network response - cache it
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // No cache either - return offline page or error
          return new Response('Hors ligne - contenu non disponible', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Listen for update messages
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
