const CACHE_NAME = 'cha-casa-nova-dynamic-cache';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam GET (como POST de formulários)
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Nunca cacheia o painel administrativo ou área de login
  if (url.pathname.includes('/Admin') || url.pathname.includes('/Login')) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isHtml = event.request.headers.get('accept')?.includes('text/html') || 
                 event.request.mode === 'navigate';

  if (isHtml) {
    // Páginas HTML sempre vêm da rede em tempo real. Não armazena cache delas.
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // Cache dinâmico para arquivos estáticos (CSS, JS, Imagens, Fontes)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
