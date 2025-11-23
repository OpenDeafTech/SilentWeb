import { api, runtimeSend, tabsSend, addRuntimeMessageListener } from "../platform/browser";
const routes = new Map();
export function route(type, handler) {
    routes.set(type, handler);
}
export async function send(type, payload) {
    if (api?.runtime?.sendMessage) {
        return (await runtimeSend({ type, payload })) ?? null;
    }
    const h = routes.get(type);
    return h ? (await h({ type, payload })) : null;
}
export async function sendToTab(tabId, type, payload) {
    if (api?.tabs?.sendMessage) {
        return (await tabsSend(tabId, { type, payload })) ?? null;
    }
    const h = routes.get(type);
    return h ? (await h({ type, payload })) : null;
}
// Listener global: retourne true pour signaler un traitement async à WebExtensions
addRuntimeMessageListener((msg, _sender, sendResponse) => {
    (async () => {
        try {
            const h = routes.get(msg?.type);
            const res = h ? await h(msg) : null;
            sendResponse(res);
        }
        catch (e) {
            sendResponse({ ok: false, error: String(e) });
        }
    })();
    return true;
});
export const bus = { route, send, sendToTab };
export default bus;
