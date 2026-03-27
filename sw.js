const CACHE = 'musab-finance-v2';  // bumped — forces old cache to clear
const ASSETS = ['./index.html', './app.js', './data.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'];

self.addEventListener('install', e => {
  self.skipWaiting();  // take control immediately, don't wait
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())  // claim all open tabs immediately
  );
});
self.addEventListener('fetch', e =>
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
);
