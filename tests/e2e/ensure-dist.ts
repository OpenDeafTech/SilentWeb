/* ============================================================================
   tests/e2e/ensure-dist.ts
   Build dist/ if manifest.json is missing before Playwright starts its server.
   ============================================================================ */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const manifestPath = path.join(repoRoot, "dist", "manifest.json");

export function ensureDistBuild() {
  if (existsSync(manifestPath)) {
    return;
  }

  console.log("[e2e] dist/manifest.json missing, running pnpm run build...");
  try {
    execSync("pnpm run build", { cwd: repoRoot, stdio: "inherit" });
  } catch (error) {
    console.error("[e2e] Unable to build dist/ before starting Playwright.");
    throw error;
  }
}
