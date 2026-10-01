const CACHE_NAME = 'ocean-of-aliens-shell-v6';
const APP_SHELL = [
  '/oceanofaliens.html',
  '/ocean-of-aliens.webmanifest',
  '/images/ocean-of-aliens/app-icon-192.png',
  '/images/ocean-of-aliens/app-icon-512.png',
  '/images/ocean-of-aliens/ocean-of-aliens-splash.webp',
  '/mp3/pilot-male-hit.mp3',
  '/mp3/pilot-male-defeat.mp3',
  '/mp3/pilot-female-hit.mp3',
  '/mp3/pilot-female-defeat.mp3',
  '/mp3/boss-defeat.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  // Network-first keeps published game updates immediate. The latest
  // successful response is retained so an installed mobile app can still
  // launch if connectivity drops.
  event.respondWith(
    fetch(request).then(response => {
      if(response && response.status === 200){
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then(cached => {
      if(cached) return cached;
      if(request.mode === 'navigate') return caches.match('/oceanofaliens.html');
      return Response.error();
    }))
  );
});
