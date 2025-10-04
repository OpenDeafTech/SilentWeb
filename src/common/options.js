import { DEFAULT_THEME, STORAGE_KEYS } from "./constants.js";

/**
 * Charge une option depuis chrome.storage.local.
 * Renvoie undefined si la clé n'existe pas.
 */
export async function loadOption(key) {
  const obj = await chrome.storage.local.get([key]);
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}

/**
 * Sauvegarde une option dans chrome.storage.local.
 */
export async function saveOption(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

/**
 * Charge le thème ou renvoie celui par défaut si aucun n’est défini.
 */
export async function loadThemeOrDefault() {
  const theme = await loadOption(STORAGE_KEYS.THEME);
  return theme || DEFAULT_THEME;
}

/**
 * Définit le thème choisi dans le stockage local.
 */
export async function saveTheme(theme) {
  await saveOption(STORAGE_KEYS.THEME, theme);
}
