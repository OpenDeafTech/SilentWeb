import { describe, it, beforeAll, beforeEach, expect, vi } from 'vitest';

const swListeners = { install: null, activate: null, fetch: null };
const ORIGIN = 'http://localhost';

beforeAll(async () => {
  const origAdd = globalThis.addEventListener?.bind(globalThis);
  globalThis.addEventListener = (type, listener, opts) => {
    if (type === 'install' || type === 'activate' || type === 'fetch') {
      swListeners[type] = listener; return;
    }
    if (origAdd) origAdd(type, listener, opts);
  };
  await import('../../sw.js');
});

beforeEach(() => vi.clearAllMocks());

function makeInstallEvent() { return { waitUntil: vi.fn() }; }
function makeActivateEvent() { return { waitUntil: vi.fn() }; }
function makeFetchEvent(req) { return { request: req, respondWith: vi.fn((p)=>p) }; }
const url = (p) => new URL(p, ORIGIN);

describe('Service Worker: install', () => {
  it('met en cache les assets déclarés', async () => {
    const ev = makeInstallEvent();
    swListeners.install(ev);
    await ev.waitUntil.mock.calls[0][0];
    expect(caches.open).toHaveBeenCalledTimes(1);
    expect(caches.open.mock.calls[0][0]).toContain('silentweb-cache-');
  });
});

describe('Service Worker: activate', () => {
  it('supprime les anciens caches et claim les clients', async () => {
    const current = 'silentweb-cache-v1', old = 'silentweb-cache-old';
    caches.keys.mockResolvedValueOnce([current, old]);
    const ev = makeActivateEvent();
    swListeners.activate(ev);
    await ev.waitUntil.mock.calls[0][0];
    expect(caches.delete).toHaveBeenCalledWith(old);
    expect(globalThis.clients.claim).toHaveBeenCalled();
  });
});

describe('Service Worker: fetch', () => {
  it('sert depuis le cache si présent', async () => {
    const req = new Request(url('/index.html'));
    const cached = new Response('cached', { status: 200 });
    caches.match.mockResolvedValueOnce(cached);
    const ev = makeFetchEvent(req);
    const resp = await swListeners.fetch(ev) || (await ev.respondWith.mock.calls[0][0]);
    expect(await resp.text()).toBe('cached');
  });

  it('récupère sur le réseau et met en cache si miss', async () => {
    const req = new Request(url('/style.css'));
    caches.match.mockResolvedValueOnce(undefined);
    const netResp = new Response('net', { status: 200 });
    globalThis.fetch.mockResolvedValueOnce(netResp);
    const ev = makeFetchEvent(req);
    await swListeners.fetch(ev);
    expect(caches.open).toHaveBeenCalledTimes(1);
    const cacheObj = await caches.open.mock.results[0].value;
    expect(cacheObj.put).toHaveBeenCalled();
  });

  it('retourne le fallback /index.html en cas d’échec réseau', async () => {
    const req = new Request(url('/page-qui-echoue'));
    caches.match.mockResolvedValueOnce(undefined);
    globalThis.fetch.mockRejectedValueOnce(new Error('net-fail'));
    const fallback = new Response('<html>offline</html>', { status: 200 });
    caches.match.mockResolvedValueOnce(fallback);
    const ev = makeFetchEvent(req);
    const resp = await swListeners.fetch(ev) || (await ev.respondWith.mock.calls[0][0]);
    expect(await resp.text()).toContain('offline');
  });
});
