// API utilisée par tests/unit/inject.spec.js

/** @param {string} selector */
export async function inspectElement(selector) {
  if (typeof selector !== "string" || !selector) return false;

  await new Promise((r) =>
    chrome?.storage?.local?.set
      ? chrome.storage.local.set({ inspected: selector }, r)
      : r()
  );

  await new Promise((r) =>
    chrome?.runtime?.sendMessage
      ? chrome.runtime.sendMessage({ type: "INSPECT", selector }, r)
      : r()
  );

  return true;
}

/** @param {number} tabId @param {string} selector */
export async function highlightElement(tabId, selector) {
  if (typeof tabId !== "number" || !selector) return false;

  await new Promise((r) =>
    chrome?.tabs?.sendMessage
      ? chrome.tabs.sendMessage(tabId, { type: "HIGHLIGHT", selector }, r)
      : r()
  );
  return true;
}
