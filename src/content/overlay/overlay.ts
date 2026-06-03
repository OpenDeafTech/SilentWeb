import { logInfo } from "../utils/logger";

export function initOverlay() {
  logInfo("overlay initialized");

  if (document.getElementById("silentweb-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "silentweb-overlay";
  overlay.textContent = "SilentWeb Overlay actif";

  document.body.appendChild(overlay);
}
