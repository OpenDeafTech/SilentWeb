// src/inject.js
export async function inspectElement(selector) {
  return new Promise((resolveOuter) => {
    chrome.storage.local.set({ inspected: selector }, () => {
      chrome.runtime.sendMessage({ type: "INSPECT", selector }, () => {
        resolveOuter();
      });
    });
  });
}

export async function highlightElement(tabId, selector) {
  return new Promise((resolveOuter) => {
    chrome.tabs.sendMessage(tabId, { type: "HIGHLIGHT", selector }, () => {
      resolveOuter();
    });
  });
}

export default { inspectElement, highlightElement };
