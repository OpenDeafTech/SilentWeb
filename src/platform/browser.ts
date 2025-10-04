// src/platform/browser.ts
type RuntimeLike = {
  getURL?: (p: string) => string;
  sendMessage?: (msg: any, cb?: (resp: any) => void) => void;
  onMessage?: { addListener: (fn: (msg: any, sender: any, sendResponse: (res: any) => void) => any) => void };
  lastError?: unknown;
};
type StorageLocalLike = { get?: (k?: any, cb?: (r: Record<string, any>) => void) => void; set?: (i: Record<string, any>, cb?: () => void) => void; clear?: (cb?: () => void) => void; };
type TabsLike = { sendMessage?: (tabId: number, msg: any, cb?: (resp: any) => void) => void; query?: (i: Record<string, any>, cb: (t: Array<{ id?: number; url?: string }>) => void) => void; };
type ChromeLike = { runtime?: RuntimeLike; storage?: { local?: StorageLocalLike }; tabs?: TabsLike; };

const g = globalThis as any;
export const api: ChromeLike = (g.chrome as ChromeLike) ?? (g.browser as ChromeLike) ?? {};
export const isChrome = !!g.chrome;
export const isFirefox = !!g.browser && !isChrome;

export function getURL(path: string): string { return api.runtime?.getURL ? api.runtime.getURL(path) : path; }

export function runtimeSend<T = any>(msg: any): Promise<T> {
  const rt = api.runtime;
  if (!rt?.sendMessage) return Promise.resolve(undefined as unknown as T);
  return new Promise<T>((resolve, reject) => {
    rt.sendMessage!(msg, (resp: T) => {
      const err = (api.runtime as any)?.lastError;
      err ? reject(err) : resolve(resp);
    });
  });
}

export function tabsSend<T = any>(tabId: number, msg: any): Promise<T> {
  const t = api.tabs;
  if (!t?.sendMessage) return Promise.resolve(undefined as unknown as T);
  return new Promise<T>((resolve, reject) => {
    t.sendMessage!(tabId, msg, (resp: T) => {
      const err = (api.runtime as any)?.lastError;
      err ? reject(err) : resolve(resp);
    });
  });
}

export function storageGet<T = unknown>(key: string | string[] | null, fallback?: any): Promise<T> {
  const s = api.storage?.local; if (!s?.get) return Promise.resolve(fallback as T);
  return new Promise<T>((resolve) => {
    s.get!(key as any, (obj: Record<string, any>) => {
      if (key === null || Array.isArray(key)) return resolve(obj as unknown as T);
      resolve((obj?.[key as string] ?? fallback) as T);
    });
  });
}
export function storageSet(items: Record<string, any>): Promise<void> {
  const s = api.storage?.local; if (!s?.set) return Promise.resolve();
  return new Promise<void>((resolve) => s.set!(items, () => resolve()));
}
export function storageClear(): Promise<void> {
  const s = api.storage?.local; if (!s?.clear) return Promise.resolve();
  return new Promise<void>((resolve) => s.clear!(() => resolve()));
}

// Listener runtime (3 args)
export function addRuntimeMessageListener(
  fn: (msg: any, sender: any, sendResponse: (res: any) => void) => any
): void {
  api.runtime?.onMessage?.addListener?.(fn as any);
}

// Back-compat: wrapper 1-arg -> 3-args
export function onMessage(fn: (msg: any) => any): void {
  addRuntimeMessageListener((msg) => fn(msg));
}

export function queryTabs(info: Record<string, any>): Promise<Array<{ id?: number; url?: string }>> {
  const t = api.tabs; if (!t?.query) return Promise.resolve([]);
  return new Promise((resolve) => t.query!(info, resolve));
}
