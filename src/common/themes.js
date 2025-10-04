import { THEMES } from "./constants.js";

/**
 * Applique un thème global via data-theme sur <html>.
 */
export function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  document.documentElement.dataset.theme = theme;
}

/**
 * Bascule entre les thèmes clair et sombre.
 * Renvoie le thème activé.
 */
export function toggleTheme() {
  const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
