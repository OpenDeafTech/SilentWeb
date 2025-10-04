// src/content/inject.ts

// ✅ Déclare le namespace Chrome si le type n’est pas chargé
declare const chrome: {
  storage: {
    local: {
      get: (keys: string[] | string, callback: (items: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, callback?: () => void) => void;
      remove: (keys: string[] | string, callback?: () => void) => void;
    };
  };
  runtime: {
    sendMessage: (message: unknown) => void;
  };
};

export function inspectElement(selector: string): Promise<void> {
  return new Promise<void>((resolve): void => {
    chrome.storage.local.set({ inspected: selector }, (): void => {
      chrome.runtime.sendMessage({ type: "INSPECT", selector });
      resolve();
    });
  });
}

export async function getInspected(): Promise<string | undefined> {
  const result = await new Promise<Record<string, unknown>>((resolve): void => {
    chrome.storage.local.get(["inspected"], (items) => resolve(items));
  });

  const value = result["inspected"];
  return typeof value === "string" ? value : undefined;
}

export function clearInspected(): Promise<void> {
  return new Promise<void>((resolve): void => {
    chrome.storage.local.remove(["inspected"], (): void => resolve());
  });
}
