// service-worker.js
// Fichier nécessaire pour enregistrer la Progressive Web App (PWA)

const CACHE_NAME = 'jeoahs-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/plans.html',
  '/jeoah-widget.html',
  '/public/jeoah-loader.js',
  '/public/manifest.json',
  '/public/assets/logo.png'
];

// Événement d'installation: Met en cache les fichiers de base
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources principales.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Événement d'activation: Nettoie les anciens caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

// Événement fetch: Sert les ressources depuis le cache si possible, sinon réseau
self.addEventListener('fetch', event => {
  // Les APIs et les données Firebase doivent toujours atteindre le réseau.
  if (event.request.url.includes('/api/') || event.request.url.includes('googleapis.com') || event.request.url.includes('gstatic.com')) {
    return;
  }

  // Stratégie Réseau en premier (Network-First) avec repli cache hors-ligne
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

