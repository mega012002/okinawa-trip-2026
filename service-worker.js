const CACHE_NAME = 'okinawa-trip-v1';
// 列出所有需要離線儲存的檔案
const urlsToCache = [
    '/okinawa_trip_app.html',
    '/manifest.json',
    '/service-worker.js', // 服務工作線程本身也要緩存
    // 假設您的圖標在這裡 (請確保您已準備好這些圖片)
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    // 外部的 CSS 庫，讓 App 離線也能保持美觀
    'https://cdn.tailwindcss.com'
];

// 安裝服務工作線程，將所有檔案放入緩存
self.addEventListener('install', event => {
  console.log('[Service Worker] 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 緩存開啟並預先存取所有檔案');
        return cache.addAll(urlsToCache).catch(error => {
            console.error('[Service Worker] 緩存部分檔案失敗:', error);
            // 允許部分失敗，App 仍可運行
        });
      })
  );
});

// 攔截網路請求：優先從緩存中獲取 (Cache First 策略)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 緩存中有回應，則直接返回
        if (response) {
          return response;
        }
        // 緩存中沒有，則進行網路請求
        return fetch(event.request);
      })
  );
});

// 啟用新的服務工作線程，並清理舊的緩存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 啟用中...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] 刪除舊緩存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});