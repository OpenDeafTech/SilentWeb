#!/usr/bin/env node

/**
 * Orchestrate the assisted translation pipeline:
 * 1. Export the canonical CSV (locales-language-labels.csv).
 * 2. Generate per-locale TODO CSV files for TMS/LLM pre-translation.
 * 3. Remind contributors where the prompts/glossary live.
 */

import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { spawn } from "child_process";

import { listLocales, readLocale } from "./lib/locale-utils.mjs";
import { lintLocales } from "./locales-lint.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const EXPORT_SCRIPT = path.join(ROOT, "scripts", "export-language-labels.mjs");
const PENDING_DIR = path.join(ROOT, "translations", "pipeline");
const PROMPT_PATH = path.join(ROOT, "translations", "prompts", "llm-base.md");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { skipExport: false, locales: null };
  for (const arg of args) {
    if (arg === "--skip-export") {
      options.skipExport = true;
    } else if (arg.startsWith("--locales=")) {
      options.locales = arg
        .split("=")[1]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }
  return options;
}

function runNodeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} failed with exit code ${code}`));
      }
    });
  });
}

function toCsvRow(values) {
  return values
    .map((value) => {
      const str = value == null ? "" : String(value);
      if (!str) return "";
      return `"${str.replace(/"/g, '""')}"`;
    })
    .join(",");
}

function extractPlaceholders(message) {
  if (!message) return "";
  const tokens = new Set();
  const patterns = [/\$[0-9]+/g, /%(\d+\$)?[sd]/gi, /\{[A-Z0-9_]+\}/gi];
  for (const pattern of patterns) {
    const matches = message.match(pattern);
    if (matches) {
      matches.forEach((match) => tokens.add(match));
    }
  }
  return [...tokens].join(" ");
}

async function writePendingCsv(locale, rows) {
  if (!rows.length) {
    const existing = path.join(PENDING_DIR, `${locale}.pending.csv`);
    try {
      await fs.unlink(existing);
    } catch {
      // ignore
    }
    return;
  }
  await fs.mkdir(PENDING_DIR, { recursive: true });
  const header = ["key", "source_en", "current_value", "context", "placeholders"];
  const content = [header.join(","), ...rows.map((row) => toCsvRow(row))].join("\n");
  const filePath = path.join(PENDING_DIR, `${locale}.pending.csv`);
  await fs.writeFile(filePath, `${content}\n`, "utf8");
}

async function main() {
  const options = parseArgs();
  if (!options.skipExport) {
    console.log("Exporting canonical CSV via locales:export…");
    await runNodeScript(EXPORT_SCRIPT);
  }

  const locales = options.locales || (await listLocales());
  const lintResult = await lintLocales();
  const referenceLocale = lintResult.referenceLocale;
  const referenceData = await readLocale(referenceLocale);

  const issuesByLocale = new Map();
  for (const issue of lintResult.issues) {
    if (!issuesByLocale.has(issue.locale)) {
      issuesByLocale.set(issue.locale, []);
    }
    issuesByLocale.get(issue.locale).push(issue);
  }

  for (const locale of locales) {
    if (locale === referenceLocale) continue;
    const localeIssues = issuesByLocale.get(locale) || [];
    const actionable = localeIssues.filter((issue) =>
      ["missingTranslation", "unchangedTranslation"].includes(issue.type)
    );
    const rows = actionable.map((issue) => {
      const referenceEntry = referenceData.messages[issue.key] || {};
      const source = referenceEntry.message || "";
      const context = referenceEntry.description || "";
      const placeholders = extractPlaceholders(source);
      const currentValue = issue.type === "unchangedTranslation" ? source : "";
      return [issue.key, source, currentValue, context, placeholders];
    });
    await writePendingCsv(locale, rows);
    if (rows.length) {
      console.log(`Locale ${locale}: ${rows.length} entrée(s) à pré-traduire -> translations/pipeline/${locale}.pending.csv`);
    } else {
      console.log(`Locale ${locale}: rien à traduire.`);
    }
  }

  console.log("Pipeline prêt. Importez les CSV générés dans votre TMS/LLM en utilisant les prompts:");
  console.log(`- Prompts LLM: ${path.relative(ROOT, PROMPT_PATH)}`);
  console.log("- CSV source: locales-language-labels.csv");
  console.log("Après pré-traduction, réinjectez les fichiers dans `_locales/**` puis exécutez `pnpm run locales:update`.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
