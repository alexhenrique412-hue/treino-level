// IronLevel PWA Service Worker - Versão Auto-Atualizável
const CACHE_NAME = 'ironlevel-v19';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './blue-flames-bg.svg',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './halteres-iron.jpg',
  './bodybuilder-enso.jpg',
  './samurai-preview.jpg'
];

// Instalação Imediata (skipWaiting forçado para não prender versão antiga)
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Ativação Imediata (clients.claim para controlar todas as abas abertas na hora)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Removendo cache obsoleto:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && (event.data.action === 'skipWaiting' || event.data.action === 'forceUpdate')) {
    self.skipWaiting();
  }
});

// Estratégia Inteligente:
// 1. Network-First com bypass de cache para código do app (index.html, app.js, style.css)
//    -> Garante que se o usuário tiver internet, ele SEMPRE recebe as novidades na hora sem desinstalar!
// 2. Se estiver offline -> Entrega direto do cache local sem travar.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  // Ignora chamadas externas de mapas Leaflet e CDNs
  if (url.origin !== location.origin) return;

  const isCoreAsset = e.request.mode === 'navigate' ||
                      url.pathname.endsWith('.html') ||
                      url.pathname.endsWith('.js') ||
                      url.pathname.endsWith('.css') ||
                      url.pathname === '/' ||
                      url.pathname.endsWith('/');

  if (isCoreAsset) {
    // Tenta baixar a versão nova direto da rede
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Se falhou (sem internet), busca no cache
          return caches.match(e.request).then((res) => res || caches.match('./index.html'));
        })
    );
  } else {
    // Imagens e ícones: Cache com atualização em segundo plano (Stale-While-Revalidate)
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((netRes) => {
          if (netRes && netRes.status === 200) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return netRes;
        }).catch(() => null);
        return cached || fetchPromise;
      })
    );
  }
});
