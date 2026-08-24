/**
 * service-worker.js — PWA Service Worker
 * Estrategia Cache-First para recursos estáticos,
 * Network-First para requests externos.
 */

const CACHE_NAME = 'payments-v1.0.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './css/responsive.css',
  './js/storage.js',
  './js/utils.js',
  './js/categories.js',
  './js/transactions.js',
  './js/budgets.js',
  './js/goals.js',
  './js/subscriptions.js',
  './js/statistics.js',
  './js/ui.js',
  './js/app.js',
  './assets/icons/icon.png',
];

// Recursos externos (Chart.js desde CDN)
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

// ── INSTALL: pre-cache all static assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets (must succeed)
      const localPromise = cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Error caching local assets:', err);
      });
      // Cache CDN assets (best effort)
      const cdnPromise = Promise.allSettled(
        CDN_ASSETS.map(url =>
          fetch(url, { mode: 'cors' })
            .then(response => {
              if (response.ok) return cache.put(url, response);
            })
            .catch(() => { /* CDN may be unavailable */ })
        )
      );
      return Promise.all([localPromise, cdnPromise]);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-First for static, Network-First for API ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Skip Google Fonts HTML (let browser handle it)
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Cache-First for local files and CDN assets
  event.respondWith(cacheFirstStrategy(request));
});

async function cacheFirstStrategy(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Not in cache — fetch from network
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Offline and not cached
    const cached = await caches.match('./index.html');
    if (cached) return cached;
    return new Response('Offline — App not cached yet. Please connect to internet first.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
