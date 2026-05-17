const CACHE_NAME = 'cinemaworld-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './actors.html',
  './manifest.json',
  './style.css',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 1. Кэширование при установке
self.addEventListener('install', (event) => {
  console.log('[SW] Установка...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кэширование базовых файлов');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Очистка старых кэшей при активации
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 3. Обработка запросов (Cache-First с фоллбэком на сеть)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Офлайн-заглушка
      return new Response(`
        <html><body style="font-family:sans-serif;background:#0f0c29;color:#fff;text-align:center;padding:50px;">
          <h1>📶 Офлайн-режим</h1>
          <p>Проверьте подключение к интернету.</p>
          <a href="./index.html" style="color:#e50914;">Вернуться на главную</a>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    })
  );
});