// packages/core/src/index.ts
// SilentWeb Core — base commune : types, utils, audio, texte, async, events

export const CORE_VERSION = "1.0.0";

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
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[“”«»]/g, '"')
    .replace(/[’]/g, "'");
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
