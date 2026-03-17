const CACHE_NAME = 'hermanamiento-pwa-v1';
const RUNTIME_CACHE = 'hermanamiento-runtime-v1';
const ASSETS_CACHE = 'hermanamiento-assets-v1';

const PRECACHE_URLS = [
  '/hermanamiento/',
  '/hermanamiento/index.html',
  '/hermanamiento/pages/evento.html',
  '/hermanamiento/pages/culto.html',
  '/hermanamiento/pages/recorrido.html',
  '/hermanamiento/pages/fiesta.html',
  '/hermanamiento/pages/protocolo.html',
  '/hermanamiento/pages/ciudades.html',
  '/hermanamiento/pages/galeria.html',
  '/hermanamiento/pages/contacto.html',
  '/hermanamiento/assets/styles/main.css',
  '/hermanamiento/assets/styles/layout.css',
  '/hermanamiento/assets/styles/typography.css',
  '/hermanamiento/assets/styles/animations.css',
  '/hermanamiento/assets/styles/responsive.css',
  '/hermanamiento/scripts/app.js',
  '/hermanamiento/manifest.json',
  '/hermanamiento/offline.html'
];

// INSTALL EVENT
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache error:', error);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE EVENT
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== ASSETS_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH EVENT
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and external requests with specific conditions
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Route handling
  if (url.origin === location.origin) {
    // Local requests: Cache-First
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // External requests: Network-First
    event.respondWith(networkFirstStrategy(request));
  }
});

// CACHE-FIRST STRATEGY (for local assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch error:', error);

    // Serve offline page for document requests
    if (request.destination === 'document') {
      return caches.match('/hermanamiento/offline.html');
    }

    // Return generic error response
    return new Response('Contenido no disponible sin conexión', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain; charset=utf-8'
      })
    });
  }
}

// NETWORK-FIRST STRATEGY (for external resources)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, using cache for:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return placeholder for failed images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="14">Sin conexión</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' }
        }
      );
    }

    throw error;
  }
}

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Syncing data...');
  // Add sync logic here if needed
}

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nueva notificación de Hermanamiento 2026',
    icon: '/assets/images/icons/icon-192x192.svg',
    badge: '/assets/images/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/assets/images/icons/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/assets/images/icons/icon-96x96.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Hermanamiento 2026', options)
  );
});

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// NOTIFICATION CLOSE
self.addEventListener('notificationclose', (_event) => {
  console.log('[Service Worker] Notification closed');
});

// MESSAGE HANDLER (for communication with client)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      console.log('[Service Worker] Runtime cache cleared');
    });
  }
});

// SERVICE WORKER UPDATE
self.addEventListener('controllerchange', () => {
  console.log('[Service Worker] Controller changed');
});

console.log('[Service Worker] Script loaded');
