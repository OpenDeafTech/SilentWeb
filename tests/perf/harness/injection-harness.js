(() => {
  const OVERLAY_ID = "silentweb-overlay";
  const perf = (window.__silentwebPerf = {
    route: window.location.pathname,
    startedAt: performance.now(),
    ready: false,
  });

  function signalError(error) {
    perf.error = error instanceof Error ? error.message : String(error);
    perf.ready = false;
    window.dispatchEvent(new CustomEvent("silentweb:overlay-error", { detail: perf }));
  }

  function markComplete(startTimestamp) {
    const mountedAt = performance.now();
    perf.latency = mountedAt - perf.startedAt;
    perf.mountDuration = mountedAt - startTimestamp;
    perf.ready = true;
    window.dispatchEvent(new CustomEvent("silentweb:overlay-ready", { detail: perf }));
  }

  function mountOverlay() {
    const mountStart = performance.now();
    try {
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("data-silentweb-perf", "true");
      overlay.textContent = "SilentWeb overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.right = "0";
      overlay.style.padding = "8px";
      overlay.style.background = "rgba(0,0,0,0.7)";
      overlay.style.color = "white";
      overlay.style.zIndex = "9999";
      document.body.appendChild(overlay);
      markComplete(mountStart);
    } catch (error) {
      signalError(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountOverlay(), { once: true });
  } else {
    mountOverlay();
  }
})();
