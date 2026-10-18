/* App-shell caching only. Retailer searches and future pricing API requests are never cached. */
const CACHE_NAME = 'phone-comparison-v2';
const STATIC_FILES = ['./','./index.html','./js/app.js','./js/calculator.js','./js/catalogue.js','./app.webmanifest','./icons/phone.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith('phone-comparison-') && name !== CACHE_NAME).map(name => caches.delete(name))
  )));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && STATIC_FILES.some(path => new URL(path,self.registration.scope).pathname === url.pathname)) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request,copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html'))));
});
