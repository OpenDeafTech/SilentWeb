// tests/utils/dom.ts
/**
 * Remplace le contenu du <body> avec le HTML fourni.
 * Retourne le premier élément racine monté.
 */
export function mount(html) {
    document.body.innerHTML = html;
    return document.body.firstElementChild;
}
/**
 * Nettoie complètement le DOM (équivalent à un reset entre tests).
 */
export function resetDOM() {
    document.body.innerHTML = "";
}
/**
 * Crée un élément avec attributs et enfants optionnels.
 */
export function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    children.forEach(c => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return el;
}
