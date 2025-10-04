export function isElement(node) {
return node instanceof Element;
}


export function $(selector, root = document) {
return root.querySelector(selector);
}


export function $all(selector, root = document) {
return Array.from(root.querySelectorAll(selector));
}


export function addClass(el, name) {
if (el && name) el.classList.add(name);
}


export function rmClass(el, name) {
if (el && name) el.classList.remove(name);
}