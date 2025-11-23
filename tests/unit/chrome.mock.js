// tests/unit/chrome.mock.js
import { vi } from "vitest";

const storageData = {};

const storageLocal = {
  set: vi.fn((items = {}, cb) => {
    Object.assign(storageData, items);
    if (cb) cb();
  }),
  get: vi.fn((keys, cb) => {
    let out = {};
    if (typeof keys === "string") {
      out[keys] = storageData[keys];
    } else if (Array.isArray(keys)) {
      out = keys.reduce((acc, key) => {
        acc[key] = storageData[key];
        return acc;
      }, {});
    } else if (keys && typeof keys === "object") {
      out = { ...keys };
      for (const key of Object.keys(keys)) {
        if (Object.prototype.hasOwnProperty.call(storageData, key)) {
          out[key] = storageData[key];
        }
      }
    } else {
      out = { ...storageData };
    }
    if (cb) cb(out);
  }),
  remove: vi.fn((keys, cb) => {
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach((key) => {
      if (key != null) delete storageData[key];
    });
    if (cb) cb();
  }),
};

Object.defineProperty(storageLocal, "data", {
  get() {
    return storageData;
  },
  set(value) {
    Object.keys(storageData).forEach((key) => delete storageData[key]);
    if (value && typeof value === "object") Object.assign(storageData, value);
  },
});

export const chrome = {
  runtime: {
    sendMessage: vi.fn((message, cb) => {
      if (cb) cb({ ok: true });
    }),
  },
  tabs: {
    sendMessage: vi.fn((tabId, message, cb) => {
      if (cb) cb({ ok: true });
    }),
  },
  storage: {
    local: storageLocal,
  },
};
