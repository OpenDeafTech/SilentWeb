/* ============================================================================
   tests/e2e/ensure-dist.cts
   Build dist/ if manifest.json is missing before Playwright starts its server.
   ============================================================================ */

const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

// Resolve the repository root from the e2e folder.
const repoRoot = path.resolve(__dirname, "..", "..");
const manifestPath = path.join(repoRoot, "dist", "manifest.json");

function ensureDistBuild() {
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

module.exports = { ensureDistBuild };

// Allow running this helper directly (e.g., from an npm script).
if (require.main === module) {
  ensureDistBuild();
}
