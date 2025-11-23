// packages/core/src/index.ts
// SilentWeb Core — base commune : types, utils, audio, texte, async, events

export const CORE_VERSION = "1.1.1";

/* -------------------------------------------------------------------------- */
/* Types globaux                                                              */
/* -------------------------------------------------------------------------- */
export interface TranscriptionResult {
  text: string;
  confidence: number; // 0.0 → 1.0
  lang?: string;
  words?: { value: string; start: number; end: number; conf?: number }[];
}

export interface AlertOptions {
  type: "info" | "warn" | "error" | "success";
  message: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}

export interface AudioFrame {
  pcm: Float32Array; // audio normalisé [-1.0, 1.0]
  sampleRate: number;
}

/* -------------------------------------------------------------------------- */
/* Utilitaires string/texte                                                    */
/* -------------------------------------------------------------------------- */
export function normalizeText(input: string): string {
  if (!input) return "";

  let normalized = input;
  // Replace common Unicode whitespaces with ASCII spaces
  normalized = normalized.replace(
    /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g,
    " "
  );
  // Normalize smart double quotes / guillemets
  normalized = normalized
    .replace(/[«»]/g, '"')
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  // Normalize smart single quotes / primes
  normalized = normalized.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  // Condense and trim
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

export function capitalize(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Fabriques / modèles                                                         */
/* -------------------------------------------------------------------------- */
export function makeTranscription(
  text: string,
  confidence = 1.0,
  lang = "und",
  words?: TranscriptionResult["words"]
): TranscriptionResult {
  return {
    text: normalizeText(text),
    confidence,
    lang,
    words,
  };
}

export function makeAlert(opts: AlertOptions): Required<AlertOptions> {
  return {
    type: opts.type,
    message: normalizeText(opts.message),
    timestamp: opts.timestamp ?? Date.now(),
    context: opts.context ?? {},
  };
}

/* -------------------------------------------------------------------------- */
/* Async helpers                                                               */
/* -------------------------------------------------------------------------- */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  reason = "Timeout"
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(reason)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/* -------------------------------------------------------------------------- */
/* EventEmitter minimal (extension-safe)                                      */
/* -------------------------------------------------------------------------- */
export class Emitter<T = unknown> {
  private listeners: Array<(data: T) => void> = [];

  on(cb: (data: T) => void): () => void {
    this.listeners.push(cb);
    return () => this.off(cb);
  }

  off(cb: (data: T) => void): void {
    this.listeners = this.listeners.filter((l) => l !== cb);
  }

  emit(data: T): void {
    for (const l of this.listeners) {
      try {
        l(data);
      } catch (err) {
        console.error("[SilentWeb Emitter]", err);
      }
    }
  }

  clear(): void {
    this.listeners = [];
  }
}

/* -------------------------------------------------------------------------- */
/* Audio utils                                                                 */
/* -------------------------------------------------------------------------- */
export function normalizePCM(input: Float32Array): Float32Array {
  let max = 0;
  for (const v of input) max = Math.max(max, Math.abs(v));
  if (max === 0) return input;
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] / max;
  return out;
}

export function downsamplePCM(
  frame: AudioFrame,
  targetRate: number
): AudioFrame {
  const ratio = frame.sampleRate / targetRate;
  if (ratio <= 1) return frame;
  const newLength = Math.floor(frame.pcm.length / ratio);
  const out = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    out[i] = frame.pcm[Math.floor(i * ratio)];
  }
  return { pcm: out, sampleRate: targetRate };
}

/* -------------------------------------------------------------------------- */
/* Helpers génériques                                                          */
/* -------------------------------------------------------------------------- */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/* -------------------------------------------------------------------------- */
/* Export public                                                               */
/* -------------------------------------------------------------------------- */
export default {
  CORE_VERSION,
  normalizeText,
  capitalize,
  splitSentences,
  makeTranscription,
  makeAlert,
  delay,
  withTimeout,
  Emitter,
  normalizePCM,
  downsamplePCM,
  clamp,
  uid,
};
