/**
 * Récupère une valeur dans chrome.storage.local.
 */
export async function getValue(key) {
  const obj = await chrome.storage.local.get([key]);
  return obj[key];
}

/**
 * Sauvegarde une valeur dans chrome.storage.local.
 */
export async function setValue(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

/**
 * Supprime une clé du stockage local.
 */
export async function removeValue(key) {
  return chrome.storage.local.remove([key]);
}

/**
 * Vide entièrement le stockage local.
 */
export async function clearStorage() {
  return chrome.storage.local.clear();
}
