import { api, runtimeSend, tabsSend, addRuntimeMessageListener } from "../platform/browser";

export type BusMessage<T = any> = { type: string; payload?: T };
export type Handler<T = any, R = any> = (msg: BusMessage<T>) => Promise<R> | R;

const routes = new Map<string, Handler>();

export function route<T = any, R = any>(type: string, handler: Handler<T, R>): void {
  routes.set(type, handler as Handler);
}

export async function send<T = any, R = any>(type: string, payload?: T): Promise<R | null> {
  if (api?.runtime?.sendMessage) {
    return (await runtimeSend<R>({ type, payload })) ?? null;
  }
  const h = routes.get(type);
  return h ? ((await h({ type, payload })) as R) : null;
}

export async function sendToTab<T = any, R = any>(
  tabId: number,
  type: string,
  payload?: T
): Promise<R | null> {
  if (api?.tabs?.sendMessage) {
    return (await tabsSend<R>(tabId, { type, payload })) ?? null;
  }
  const h = routes.get(type);
  return h ? ((await h({ type, payload })) as R) : null;
}

// Listener global: retourne true pour signaler un traitement async à WebExtensions
addRuntimeMessageListener((msg: BusMessage, _sender: any, sendResponse: (res: any) => void) => {
  (async () => {
    try {
      const h = routes.get(msg?.type);
      const res = h ? await h(msg) : null;
      sendResponse(res);
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true;
});

export const bus = { route, send, sendToTab };
export default bus;
