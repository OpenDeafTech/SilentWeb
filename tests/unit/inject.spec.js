/* ============================================================================
   tests/unit/inspect.spec.js
   Unit tests for SilentWeb inspection utilities
   ============================================================================ */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { chrome } from "./chrome.mock.js";
import { inspectElement, highlightElement } from "../../src/utils/inspect.js";

beforeEach(() => {
  // Reset mocks et données storage
  vi.clearAllMocks();
  chrome.storage.local.data = {};
});

describe("inspectElement", () => {
  it("saves inspected element selector in chrome.storage.local", async () => {
    const selector = "#test";
    await inspectElement(selector);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { inspected: selector },
      expect.any(Function)
    );
  });

  it("sends message after inspection", async () => {
    const selector = ".item";
    await inspectElement(selector);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: "INSPECT", selector },
      expect.any(Function)
    );
  });
});

describe("highlightElement", () => {
  it("injects highlight CSS to page", async () => {
    const tabId = 1;
    await highlightElement(tabId, "#target");
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      tabId,
      { type: "HIGHLIGHT", selector: "#target" },
      expect.any(Function)
    );
  });
});
