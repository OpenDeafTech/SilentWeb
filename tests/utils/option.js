// src/utils/option.js
export function saveOption(key, value) {
  return new Promise((resolve) => {
    // met à jour le mock (chrome.storage.local.data) si présent
    if (chrome?.storage?.local?.data) {
      chrome.storage.local.data[key] = value;
    }

    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export function loadOption(key) {
  return new Promise((resolve) => {
    // lit d'abord le mock si disponible
    if (chrome?.storage?.local?.data && key in chrome.storage.local.data) {
      resolve(chrome.storage.local.data[key]);
      return;
    }

    chrome.storage.local.get(key, (items) => {
      resolve(Object.prototype.hasOwnProperty.call(items, key) ? items[key] : undefined);
    });
  });
}
