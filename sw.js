const CACHE_NAME = 'cinemaworld-v1';

// Ресурсы, которые будут закэшированы для работы оффлайн
// Используем относительные пути (./), так как sw.js лежит в корне
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов и отдача кэша или загрузка из сети
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если файл есть в кэше - возвращаем его
        if (response) {
          return response;
        }
        // Если нет - загружаем из интернета
        return fetch(event.request);
      })
  );
});

// Удаление старого кэша при обновлении
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
