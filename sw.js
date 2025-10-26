self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('app-cache').then(cache => cache.addAll(['./']))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
