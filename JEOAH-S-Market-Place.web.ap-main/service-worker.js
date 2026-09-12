// service-worker.js
// Fichier nécessaire pour enregistrer la Progressive Web App (PWA)

const CACHE_NAME = 'jeoahs-cache-v4';
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

  // Les documents HTML restent à jour, avec repli hors-ligne sur le cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourne la réponse du cache
        if (response) {
          return response;
        }
        // Pas dans le cache - va chercher sur le réseau
        return fetch(event.request);
      })
  );
});

