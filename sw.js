/* ============================================================
   AGENDA & MANAJEMEN KEGIATAN BIDAN — service worker
   Strategi:
   - Shell aplikasi (HTML/CSS/JS/ikon) di-cache saat install.
   - Navigasi + file inti (index.html, app.js, style.css):
     NETWORK-FIRST → setiap refresh mengambil versi terbaru,
     fallback ke cache bila offline (agar update langsung tampil).
   - Aset lain (ikon, manifest): cache-first.
   - Request API (Google Apps Script) TIDAK di-cache.
   ============================================================ */

const CACHE_NAME = 'agenda-bidan-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/constants.js',
  './js/utils.js',
  './js/backup.js',
  './app.js',
  './manifest.webmanifest',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
];

/* Install: simpan shell aplikasi */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Aktifkan: hapus cache versi lama */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // POST (API) tidak di-cache

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // GAS API & Telegram lewat langsung

  const isCore = req.mode === 'navigate' || /\.(js|css)$/.test(url.pathname);

  // Navigasi + JS/CSS: network-first (selalu ambil versi terbaru saat online)
  if (isCore) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('./index.html'))
        )
    );
    return;
  }

  // Aset statis lain (ikon, manifest): cache-first
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

/* Klik notifikasi → fokus / buka aplikasi */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) {
        list[0].focus();
      } else {
        self.clients.openWindow('./');
      }
    })
  );
});
