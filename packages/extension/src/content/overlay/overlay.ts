import { logInfo } from "../utils/logger";
export function initOverlay() {
  logInfo("overlay initialized");
  const el = document.createElement("div");
  el.id = "silentweb-overlay";
  el.textContent = "SilentWeb Overlay actif";
  el.style.position = "fixed"; el.style.top = "0"; el.style.left = "0"; el.style.right = "0";
  el.style.padding = "8px"; el.style.background = "rgba(0,0,0,0.7)"; el.style.color = "white"; el.style.zIndex = "9999";
  document.body.appendChild(el);
}
