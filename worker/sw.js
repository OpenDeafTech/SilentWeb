/* eslint-env serviceworker */
/**
 * @typedef {{ waitUntil(p: Promise<any>): void }} SWExtendableEvent
 * @typedef {{ request: Request, respondWith(p: Promise<Response>): void }} SWFetchEvent
 * @typedef {typeof globalThis & {
 *   skipWaiting(): void,
 *   clients: { claim(): void },
 *   addEventListener(type:'install'|'activate', listener:(e:SWExtendableEvent)=>void): void,
 *   addEventListener(type:'fetch', listener:(e:SWFetchEvent)=>void): void
 * }} ServiceWorkerGlobalScope
 */

/** @type {ServiceWorkerGlobalScope} */
const sw = /** @type {any} */ (self);

const CACHE_NAME = "silentweb-cache-v1";
/** @type {string[]} */
const ASSETS = ["/", "/index.html", "/style.css", "/bundle.js"];

// Install
sw.addEventListener("install", /** @param {SWExtendableEvent} event */ (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  sw.skipWaiting();
});

// Activate
sw.addEventListener("activate", /** @param {SWExtendableEvent} event */ (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  sw.clients.claim();
});

// Fetch
sw.addEventListener("fetch", /** @param {SWFetchEvent} event */ (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
