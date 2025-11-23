type TelemetryValue = number | string | boolean | undefined;
export type TelemetryPayload = Record<string, TelemetryValue>;

declare const __ENABLE_TELEMETRY__: string | boolean | undefined;

type GlobalLike = Record<string, unknown> & {
  process?: { env?: Record<string, unknown> };
};

function parseTelemetryFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
}

const globalRef: GlobalLike =
  typeof globalThis !== "undefined" ? (globalThis as GlobalLike) : ({} as GlobalLike);

const injectedFlag =
  typeof __ENABLE_TELEMETRY__ !== "undefined" ? __ENABLE_TELEMETRY__ : undefined;
const runtimeFlag = globalRef.ENABLE_TELEMETRY;
const envFlag = globalRef.process?.env?.ENABLE_TELEMETRY;

export const ENABLE_TELEMETRY = parseTelemetryFlag(injectedFlag ?? runtimeFlag ?? envFlag);

function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

function sanitizePayload(payload?: TelemetryPayload): TelemetryPayload {
  if (!payload) return {};
  return Object.entries(payload).reduce<TelemetryPayload>((acc, [key, value]) => {
    if (value === undefined) return acc;
    if (typeof value === "number") {
      if (Number.isFinite(value)) {
        acc[key] = Math.round(value * 100) / 100;
      }
    } else if (typeof value === "string") {
      acc[key] = value.length > 80 ? `${value.slice(0, 77)}…` : value;
    } else if (typeof value === "boolean") {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function telemetryLog(event: string, payload?: TelemetryPayload): void {
  if (!ENABLE_TELEMETRY) return;
  const safePayload = sanitizePayload(payload);
  console.info("[SilentWeb][telemetry]", event, safePayload);
}

type TelemetryStopFn = (extra?: TelemetryPayload) => void;

export function startTelemetryTimer(event: string, basePayload?: TelemetryPayload): TelemetryStopFn {
  if (!ENABLE_TELEMETRY) {
    return () => undefined;
  }
  const start = now();
  return (extra?: TelemetryPayload): void => {
    const duration = now() - start;
    telemetryLog(event, {
      ...basePayload,
      ...extra,
      durationMs: Math.round(duration),
    });
  };
}
