import { isElement, addClass, rmClass } from './dom.js';

const HIGHLIGHT_CLASS = 'sw-inspect-highlight';
const HIGHLIGHT_STYLE_ID = 'sw-inspect-style-tag';

function ensureStyleTag(doc = document) {
  if (doc.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} { outline: 2px solid #0af; outline-offset: 2px; }
  `;
  doc.head.appendChild(style);
}

/**
 * @param {Element} el
 */
export function highlightElement(el) {
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
 * @param {Element} target
 */
export function inspectElement(target) {
  if (!isElement(target)) return { ok: false, reason: 'not-an-element' };

  const tag = target.tagName.toLowerCase();
  const id = target.id || null;
  const classes = Array.from(target.classList);
  const role = target.getAttribute('role');
  const ariaLabel = target.getAttribute('aria-label');
  const name =
    ariaLabel ||
    target.getAttribute('name') ||
    target.textContent?.slice(0, 80) ||
    '';

  // Fix TypeScript: vérifier la présence de "click" et caster
  const clickable =
    'click' in target && typeof /** @type {any} */ (target).click === 'function';

  return {
    ok: true,
    node: { tag, id, classes, role, name, clickable },
  };
}
