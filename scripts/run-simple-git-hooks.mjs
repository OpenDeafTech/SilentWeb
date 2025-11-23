#!/usr/bin/env node

/**
 * Runs simple-git-hooks when available.
 * - Skips silently when NODE_ENV=production (devDependencies not installed).
 * - Skips if the CLI binary is missing from node_modules/.bin.
 */

import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const preCommitHookPath = path.join(repoRoot, ".git", "hooks", "pre-commit");
const lintStagedShimCommand = "node scripts/run-lint-staged.mjs";

function logSkip(reason) {
  console.log(`simple-git-hooks skipped (${reason})`);
}

function patchLegacyPreCommitHook() {
  if (!existsSync(preCommitHookPath)) {
    return;
  }

  let content;
  try {
    content = readFileSync(preCommitHookPath, "utf8");
  } catch {
    return;
  }

  if (!content.includes("pnpm exec lint-staged") || content.includes(lintStagedShimCommand)) {
    return;
  }

  const updated = content.replace(/pnpm exec lint-staged/g, lintStagedShimCommand);

  if (updated === content) {
    return;
  }

  writeFileSync(preCommitHookPath, updated);
  chmodSync(preCommitHookPath, 0o755);
  console.log("Updated .git/hooks/pre-commit to call run-lint-staged shim.");
}

patchLegacyPreCommitHook();

if (process.env.NODE_ENV === "production") {
  logSkip("NODE_ENV=production");
  process.exit(0);
}

const binName = process.platform === "win32" ? "simple-git-hooks.cmd" : "simple-git-hooks";
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
