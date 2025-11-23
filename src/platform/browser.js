const g = globalThis;
export const api = g.chrome ?? g.browser ?? {};
export const isChrome = !!g.chrome;
export const isFirefox = !!g.browser && !isChrome;
export function getURL(path) { return api.runtime?.getURL ? api.runtime.getURL(path) : path; }
export function runtimeSend(msg) {
    const rt = api.runtime;
    if (!rt?.sendMessage)
        return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
        rt.sendMessage(msg, (resp) => {
            const err = api.runtime?.lastError;
            err ? reject(err) : resolve(resp);
        });
    });
}
export function tabsSend(tabId, msg) {
    const t = api.tabs;
    if (!t?.sendMessage)
        return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
        t.sendMessage(tabId, msg, (resp) => {
            const err = api.runtime?.lastError;
            err ? reject(err) : resolve(resp);
        });
    });
}
export function storageGet(key, fallback) {
    const s = api.storage?.local;
    if (!s?.get)
        return Promise.resolve(fallback);
    return new Promise((resolve) => {
        s.get(key, (obj) => {
            if (key === null || Array.isArray(key))
                return resolve(obj);
            resolve((obj?.[key] ?? fallback));
        });
    });
}
export function storageSet(items) {
    const s = api.storage?.local;
    if (!s?.set)
        return Promise.resolve();
    return new Promise((resolve) => s.set(items, () => resolve()));
}
export function storageClear() {
    const s = api.storage?.local;
    if (!s?.clear)
        return Promise.resolve();
    return new Promise((resolve) => s.clear(() => resolve()));
}
// Listener runtime (3 args)
export function addRuntimeMessageListener(fn) {
    api.runtime?.onMessage?.addListener?.(fn);
}
// Back-compat: wrapper 1-arg -> 3-args
export function onMessage(fn) {
    addRuntimeMessageListener((msg) => fn(msg));
}
export function queryTabs(info) {
    const t = api.tabs;
    if (!t?.query)
        return Promise.resolve([]);
    return new Promise((resolve) => t.query(info, resolve));
}
