/* eslint-env serviceworker */
const sw = /** @type {any} */ (self);

const injectedTelemetryFlag =
  typeof __ENABLE_TELEMETRY__ !== "undefined" ? __ENABLE_TELEMETRY__ : undefined;
const telemetry = createTelemetry(sw, injectedTelemetryFlag);

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
  const meta = requestMeta(request);
  const p = caches.match(request).then((cached) => {
    if (cached) {
      logCacheEvent("cache.hit", meta);
      return cached;
    }
    logCacheEvent("cache.miss", meta);
    return fetch(request)
      .then((resp) => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        logCacheEvent("cache.store", { ...meta, status: resp.status });
        return resp;
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
  });
  e.respondWith(p);
  return p; // <— pour que le test puisse await l’effet
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
