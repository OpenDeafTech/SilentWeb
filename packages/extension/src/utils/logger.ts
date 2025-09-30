// packages/extension/src/utils/logger.ts
/* Simple logger centralisé pour SilentWeb */

export function logInfo(...args: unknown[]): void {
  console.log("[SilentWeb]", ...args);
}

export function logWarn(...args: unknown[]): void {
  console.warn("[SilentWeb]", ...args);
}

export function logError(message: string, err?: unknown): void {
  if (err instanceof Error) {
    console.error("[SilentWeb]", message, err.message, err.stack);
  } else {
    console.error("[SilentWeb]", message, err);
  }
}
