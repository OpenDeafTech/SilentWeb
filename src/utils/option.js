// src/options.js
export function saveOption(key, value) {
  return new Promise((resolve) =>
    chrome.storage.local.set({ [key]: value }, resolve)
  );
}

export function loadOption(key) {
  // Vitest attend un appel: chrome.storage.local.get("theme", callback)
  return new Promise((resolve) =>
    chrome.storage.local.get(key, (res) => resolve(res?.[key]))
  );
}
