/* eslint-env serviceworker */
const sw = /** @type {any} */ (self);

const VERSION = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID().slice(0,8) : 'test';
const CACHE_NAME = `silentweb-cache-${VERSION}`;
const ASSETS = ["/", "/index.html", "/style.css", "/bundle.js"];

sw.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  if (typeof sw.skipWaiting === 'function') sw.skipWaiting();
});

sw.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  if (sw.clients?.claim) sw.clients.claim();
});

sw.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const p = caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request)
      .then((resp) => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return resp;
      })
      .catch(() => caches.match("/index.html"));
  });
  e.respondWith(p);
  return p; // <— pour que le test puisse await l’effet
});
