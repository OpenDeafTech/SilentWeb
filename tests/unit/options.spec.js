/* ============================================================================
   tests/unit/option.spec.js
   Unit tests for SilentWeb options page utilities
   ============================================================================ */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { chrome } from "./chrome.mock.js";
import { saveOption, loadOption } from "../../src/utils/option.js";

beforeEach(() => {
  vi.clearAllMocks();
  chrome.storage.local.data = {};
});

describe("saveOption", () => {
  it("saves option to chrome.storage.local", async () => {
    await saveOption("theme", "dark");
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { theme: "dark" },
      expect.any(Function)
    );
    expect(chrome.storage.local.data.theme).toBe("dark");
  });
});

describe("loadOption", () => {
  it("loads existing option", async () => {
    chrome.storage.local.data.theme = "light";
    const value = await loadOption("theme");
    expect(value).toBe("light");
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      "theme",
      expect.any(Function)
    );
  });

  it("returns undefined if option not set", async () => {
    const value = await loadOption("missingKey");
    expect(value).toBeUndefined();
  });
});
