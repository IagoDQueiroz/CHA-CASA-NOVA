const CACHE_NAME = 'cha-casa-nova-cache-v1';
const urlsToCache = [
  '/',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/hero.css',
  '/css/sections.css',
  '/css/presentes.css',
  '/css/extra-sections.css',
  '/css/modal.css',
  '/js/main.js',
  '/js/presentes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
