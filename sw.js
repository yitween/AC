// sw.js — AC 程式設計平台 Service Worker
const CACHE = 'ac-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/guide.html',
  '/about.html',
  '/others.html',
  '/shared.css',
  '/shared.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first，失敗則用快取（離線可讀已訪問過的頁面）
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // GitHub API 不快取（確保公告永遠最新）
  if (e.request.url.includes('api.github.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
