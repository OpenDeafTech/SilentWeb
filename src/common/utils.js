/**
 * Attend un délai en millisecondes.
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Contraint une valeur dans un intervalle [min, max].
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Vérifie si un objet est vide.
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Journalise en développement uniquement.
 */
export function log(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SilentWeb]", ...args);
  }
}
