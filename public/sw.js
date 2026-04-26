const CACHE_NAME   = 'media-shell-__BUILD_ID__';
const SHELL_ASSETS = ['/'];

let _token = null;
let _fp    = null;

self.addEventListener('message', ({ data }) => {
  if (!data) return;
  if (data.type === 'SET_AUTH') {
    _token = data.token       || null;
    _fp    = data.fingerprint || null;
  }
  if (data.type === 'CLEAR_AUTH') {
    _token = null;
    _fp    = null;
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') && _token) {
    const headers = new Headers(event.request.headers);
    headers.set('Authorization', `Bearer ${_token}`);
    headers.set('X-Fingerprint', _fp || '');
    const proxied = new Request(event.request, { headers });
    event.respondWith(fetch(proxied));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
