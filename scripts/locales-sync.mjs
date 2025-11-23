#!/usr/bin/env node

/**
 * Read-only connector to external TMS providers (Lokalise, Crowdin, Smartling…).
 * The provider commands are defined in `locales-tms.config.json`.
 */

import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "locales-tms.config.json");
const UPDATE_SCRIPT = path.join(ROOT, "scripts", "sync-language-labels.mjs");

async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    throw new Error(`Missing ${path.relative(ROOT, CONFIG_PATH)}. Copy the template and configure your TMS pull command.`);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { dryRun: false };
  for (const arg of args) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--provider=")) {
      options.provider = arg.split("=")[1];
    }
  }
  return options;
}

function runShell(command, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-lc", command], {
      cwd,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" failed with code ${code}`));
      }
    });
  });
}

async function main() {
  const options = parseArgs();
  const config = await loadConfig();
  const providerKey = options.provider || config.defaultProvider;
  if (!providerKey) {
    throw new Error("No provider specified. Pass --provider=<name> or set defaultProvider in locales-tms.config.json.");
  }

  const provider = config.providers?.[providerKey];
  if (!provider) {
    throw new Error(`Unknown provider "${providerKey}". Known providers: ${Object.keys(config.providers || {}).join(", ")}`);
  }

  if (!provider.pullCommand) {
    throw new Error(`Provider "${providerKey}" is missing a pullCommand.`);
  }

  console.log(`Syncing locales from ${provider.label || providerKey} (read-only)…`);
  console.log(`Command: ${provider.pullCommand}`);
  if (options.dryRun) {
    console.log("Dry run enabled. Nothing executed.");
    return;
  }

  await runShell(provider.pullCommand, ROOT);
  console.log("TMS sync complete. Normalizing language labels via locales:update…");
  await runShell(`node ${UPDATE_SCRIPT}`, ROOT);
  console.log("Done. Remember to run `pnpm run locales:lint` before committing.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
