import { isElement, addClass, rmClass } from "./dom.js";

const HIGHLIGHT_CLASS = "sw-inspect-highlight";
const HIGHLIGHT_STYLE_ID = "sw-inspect-style-tag";

function ensureStyleTag(doc = document) {
  if (doc.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} { outline: 2px solid #0af; outline-offset: 2px; }
  `;
  doc.head.appendChild(style);
}

function getChromeGlobal() {
  // eslint-disable-next-line no-undef
  return typeof chrome !== "undefined" ? chrome : undefined;
}

function normalizeSelector(selector) {
  return typeof selector === "string" ? selector.trim() : "";
}

/**
 * @param {number|Element} targetOrTab
 * @param {string} [selector]
 */
export function highlightElement(targetOrTab, selector) {
  if (typeof targetOrTab === "number") {
    const cleanSelector = normalizeSelector(selector);
    if (!cleanSelector) return false;
    const chromeGlobal = getChromeGlobal();
    const sendMessage = chromeGlobal?.tabs?.sendMessage;
    if (typeof sendMessage !== "function") return false;
    sendMessage(targetOrTab, { type: "HIGHLIGHT", selector: cleanSelector }, () => {});
    return true;
  }
  const el = targetOrTab;
  if (!isElement(el)) return false;
  ensureStyleTag(el.ownerDocument);
  addClass(el, HIGHLIGHT_CLASS);
  return true;
}

/**
 * @param {Element} el
 */
export function clearHighlight(el) {
  if (!isElement(el)) return false;
  rmClass(el, HIGHLIGHT_CLASS);
  return true;
}

/**
 * @param {Element|string} target
 */
export function inspectElement(target) {
  if (typeof target === "string") {
    const selector = normalizeSelector(target);
    if (!selector) return false;
    const chromeGlobal = getChromeGlobal();
    const storageSet = chromeGlobal?.storage?.local?.set;
    const sendMessage = chromeGlobal?.runtime?.sendMessage;
    const send = () => {
      if (typeof sendMessage === "function") {
        sendMessage({ type: "INSPECT", selector }, () => {});
      }
    };
    if (typeof storageSet === "function") {
      storageSet({ inspected: selector }, send);
    } else {
      send();
    }
    return true;
  }

  if (!isElement(target)) return { ok: false, reason: "not-an-element" };

  const tag = target.tagName.toLowerCase();
  const id = target.id || null;
  const classes = Array.from(target.classList);
  const role = target.getAttribute("role");
  const ariaLabel = target.getAttribute("aria-label");
  const name =
    ariaLabel ||
    target.getAttribute("name") ||
    target.textContent?.slice(0, 80) ||
    "";

  const clickable =
    "click" in target && typeof /** @type {any} */ target.click === "function";

  return {
    ok: true,
    node: { tag, id, classes, role, name, clickable },
  };
}
