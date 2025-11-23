#!/usr/bin/env node

/**
 * Runs lint-staged when its binary is available.
 * - Skips instead of failing when the executable is missing (e.g. production installs).
 */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function logSkip(reason) {
  console.log(`lint-staged skipped (${reason})`);
}

const binName = process.platform === "win32" ? "lint-staged.cmd" : "lint-staged";
const binPath = path.join(repoRoot, "node_modules", ".bin", binName);

if (!existsSync(binPath)) {
  logSkip("binary missing");
  process.exit(0);
}

const result = spawnSync(binPath, { stdio: "inherit" });

if (result.error) {
  logSkip(result.error.message);
  process.exit(0);
}

process.exit(result.status ?? 0);
