const CACHE = 'agenda-bidan-v10';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest', './favicon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Online selalu memakai versi terbaru lalu memperbarui cache. Cache hanya dipakai
  // sebagai fallback saat offline, agar pembaruan UI tidak tertahan versi lama.
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    if (new URL(event.request.url).origin === self.location.origin) caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
});
