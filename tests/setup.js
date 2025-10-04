// tests/setup.js
import { vi, beforeEach } from 'vitest';
import { chrome as chromeMock } from './unit/chrome.mock.js';

// Mock global chrome
vi.stubGlobal('chrome', chromeMock);

// CacheStorage mock minimal
const store = new Map();
globalThis.caches = {
  has: vi.fn(async (n) => store.has(n)),
  open: vi.fn(async (n) => {
    if (!store.has(n)) store.set(n, new Map());
    const bucket = store.get(n);
    return {
      add: vi.fn(async () => {}),
      addAll: vi.fn(async () => {}),
      delete: vi.fn(async (req) => bucket.delete(String(req?.url || req))),
      keys: vi.fn(async () => Array.from(bucket.keys())),
      match: vi.fn(async (req) => bucket.get(String(req?.url || req))),
      matchAll: vi.fn(async () => Array.from(bucket.values())),
      put: vi.fn(async (req, res) => bucket.set(String(req?.url || req), res))
    };
  }),
  keys: vi.fn(async () => Array.from(store.keys())),
  delete: vi.fn(async (n) => store.delete(n)),
  match: vi.fn(async () => undefined)
};

// Mock clients et fetch
globalThis.clients = { claim: vi.fn() };
globalThis.fetch = vi.fn(async () =>
  new Response('net', { status: 200, headers: { 'content-type': 'text/plain' } })
);

// Reset avant chaque test
beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
