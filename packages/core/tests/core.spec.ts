// packages/core/tests/core.spec.ts
import { describe, it, expect } from "vitest";
import Core, {
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
  type TranscriptionResult,
} from "../src/index";

describe("exports", () => {
  it("exposes default and named symbols", () => {
    expect(Core).toBeTruthy();
    expect(CORE_VERSION).toMatch(/\d+\.\d+\.\d+/);
    expect(typeof Core.uid).toBe("function");
  });
});

describe("text utils", () => {
  it("normalizeText trims and normalizes quotes/spaces", () => {
    expect(normalizeText("  Hello   world  ")).toBe("Hello world");
    expect(normalizeText("«test» ‘ok’")).toBe('"test" \'ok\'');
  });

  it("capitalize uppercases first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("Éclair")).toBe("Éclair");
  });

  it("splitSentences splits by punctuation", () => {
    expect(splitSentences("One. Two? Three!")).toEqual(["One.", "Two?", "Three!"]);
  });
});

describe("factories", () => {
  it("makeTranscription produces normalized result", () => {
    const t: TranscriptionResult = makeTranscription("  Hello   world  ", 0.9, "en");
    expect(t.text).toBe("Hello world");
    expect(t.confidence).toBeCloseTo(0.9);
    expect(t.lang).toBe("en");
  });

  it("makeAlert fills timestamp and context", () => {
    const a = makeAlert({ type: "info", message: "  ok  " });
    expect(a.type).toBe("info");
    expect(a.message).toBe("ok");
    expect(typeof a.timestamp).toBe("number");
    expect(a.context).toEqual({});
  });
});

describe("async helpers", () => {
  it("delay resolves after ms", async () => {
    const t0 = Date.now();
    await delay(20);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(18);
  });

  it("withTimeout resolves before timeout", async () => {
    const res = await withTimeout(Promise.resolve(42), 50);
    expect(res).toBe(42);
  });

  it("withTimeout rejects on timeout", async () => {
    await expect(withTimeout(new Promise(() => {}), 10)).rejects.toThrow(/Timeout/);
  });
});

describe("Emitter", () => {
  it("on/emit/off works", () => {
    const em = new Emitter<number>();
    let acc = 0;
    const unsub = em.on((n) => (acc += n));
    em.emit(2);
    em.emit(3);
    expect(acc).toBe(5);
    unsub();
    em.emit(10);
    expect(acc).toBe(5);
    em.clear();
  });
});

describe("audio utils", () => {
  it("normalizePCM scales by max abs", () => {
    const src = new Float32Array([0.2, -0.4, 0.1]);
    const out = normalizePCM(src);
    const max = Math.max(...out.map((v) => Math.abs(v)));
    expect(max).toBeCloseTo(1, 5);
    // original unchanged? function returns new array
    expect(out).not.toBe(src);
  });

  it("downsamplePCM reduces length when target smaller", () => {
    const pcm = new Float32Array(100).map((_, i) => i / 100);
    const out = downsamplePCM({ pcm, sampleRate: 48000 }, 16000);
    expect(out.sampleRate).toBe(16000);
    expect(out.pcm.length).toBeLessThan(pcm.length);
  });

  it("downsamplePCM returns same frame if target >= source", () => {
    const frame = { pcm: new Float32Array([0, 1]), sampleRate: 16000 };
    const out = downsamplePCM(frame, 48000);
    expect(out).toBe(frame);
  });
});

describe("generic helpers", () => {
  it("clamp limits values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("uid returns unique-ish strings", () => {
    const a = uid("x");
    const b = uid("x");
    expect(a).not.toBe(b);
    expect(a.startsWith("x-")).toBe(true);
  });
});
