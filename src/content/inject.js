// src/content/inject.ts
export function inspectElement(selector) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ inspected: selector }, () => {
            chrome.runtime.sendMessage({ type: "INSPECT", selector });
            resolve();
        });
    });
}
export async function getInspected() {
    const result = await new Promise((resolve) => {
        chrome.storage.local.get(["inspected"], (items) => resolve(items));
    });
    const value = result["inspected"];
    return typeof value === "string" ? value : undefined;
}
export function clearInspected() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(["inspected"], () => resolve());
    });
}
