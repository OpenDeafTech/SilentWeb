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

const injectedTelemetryFlag =
  typeof __ENABLE_TELEMETRY__ !== "undefined" ? __ENABLE_TELEMETRY__ : undefined;
const telemetry = createTelemetry(sw, injectedTelemetryFlag);

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
  const meta = requestMeta(request);

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        logCacheEvent("cache.hit", meta);
        return cached;
      }
      logCacheEvent("cache.miss", meta);
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          logCacheEvent("cache.store", { ...meta, status: response?.status });
          return response;
        })
        .catch((err) =>
          caches.match("/index.html").then((fallback) => {
            logCacheEvent("cache.fallback", {
              ...meta,
              reason: err instanceof Error ? err.message.slice(0, 80) : "fetch-error",
              servedFallback: Boolean(fallback),
            });
            return fallback;
          })
        );
    })
  );
});

function requestMeta(request) {
  let bucket = "unknown";
  try {
    const { pathname } = new URL(request.url);
    const filename = pathname.split("/").filter(Boolean).pop() || "";
    if (!filename || filename === "/") bucket = "root";
    else if (filename.includes(".")) bucket = filename.split(".").pop()?.toLowerCase() || "file";
    else bucket = "file";
  } catch {
    bucket = "unknown";
  }
  return {
    destination: request.destination || "unknown",
    method: request.method,
    bucket,
  };
}

function logCacheEvent(event, meta) {
  telemetry.log(event, meta);
}

function createTelemetry(scope, injectedFlag) {
  const fromScope = scope && typeof scope === "object" ? scope.ENABLE_TELEMETRY : undefined;
  const fromProcess =
    scope && typeof scope.process === "object" && scope.process && scope.process.env
      ? scope.process.env.ENABLE_TELEMETRY
      : undefined;
  const enabled = parseTelemetryFlag(injectedFlag ?? fromScope ?? fromProcess);
  return {
    enabled,
    log(event, payload) {
      if (!enabled) return;
      console.info("[SilentWeb][telemetry]", event, payload);
    },
  };
}

function parseTelemetryFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return false;
}
