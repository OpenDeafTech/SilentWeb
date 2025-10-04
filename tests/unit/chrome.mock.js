// tests/unit/chrome.mock.js
import { vi } from 'vitest';

export const chrome = {
  runtime: {
    sendMessage: vi.fn((message, cb) => { if (cb) cb({ ok: true }); })
  },
  tabs: {
    sendMessage: vi.fn((tabId, message, cb) => { if (cb) cb({ ok: true }); })
  },
  storage: {
    local: {
      set: vi.fn((items, cb) => { if (cb) cb(); }),
      get: vi.fn((keys, cb) => {
        // Renvoie { [key]: "light" } quand key est une string (pour options.spec.js)
        let out = {};
        if (typeof keys === 'string') out[keys] = 'light';
        else if (Array.isArray(keys)) keys.forEach(k => (out[k] = undefined));
        else if (keys && typeof keys === 'object') out = { ...keys };
        if (cb) cb(out);
      })
    }
  }
};
