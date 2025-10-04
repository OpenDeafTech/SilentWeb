import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chrome } from '../unit/chrome.mock.js';
import { inspectElement, highlightElement, clearHighlight } from '../../src/utils/inspect.js';


vi.stubGlobal('chrome', chrome);


describe('inspect utils', () => {
let el;
beforeEach(() => {
document.body.innerHTML = '<button id="btn" class="x y" role="button" aria-label="OK">OK</button>';
el = document.getElementById('btn');
});


it('inspectElement returns metadata', () => {
const r = inspectElement(el);
expect(r.ok).toBe(true);
expect(r.node.tag).toBe('button');
expect(r.node.id).toBe('btn');
expect(r.node.classes).toEqual(['x', 'y']);
expect(r.node.role).toBe('button');
expect(r.node.name).toBe('OK');
expect(r.node.clickable).toBe(true);
});


it('highlight/clear toggles class', () => {
expect(highlightElement(el)).toBe(true);
expect(el.classList.contains('sw-inspect-highlight')).toBe(true);
expect(clearHighlight(el)).toBe(true);
expect(el.classList.contains('sw-inspect-highlight')).toBe(false);
});
});