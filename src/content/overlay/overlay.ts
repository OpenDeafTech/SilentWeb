import { logInfo } from "../utils/logger";

export function initOverlay() {
  logInfo("overlay initialized");

  const overlay = document.createElement("div");
  overlay.id = "silentweb-overlay";
  overlay.textContent = "SilentWeb Overlay actif";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.padding = "8px";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.color = "white";
  overlay.style.zIndex = "9999";

  document.body.appendChild(overlay);
}
