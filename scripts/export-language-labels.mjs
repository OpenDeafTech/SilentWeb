#!/usr/bin/env node

/**
 * Export the localized labels/descriptions for the main world languages into a CSV
 * file. This allows translators to review/update translations without manually
 * browsing every `_locales/<lang>/messages.json`.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "_locales");
const OUTPUT_PATH = path.join(ROOT, "locales-language-labels.csv");

const TARGET_LANGUAGES = [
  { key: "langEnglish", label: "English" },
  { key: "langFrench", label: "French" },
  { key: "langSpanish", label: "Spanish" },
  { key: "langPortuguese", label: "Portuguese" },
  { key: "langGerman", label: "German" },
  { key: "langItalian", label: "Italian" },
];

async function listLocales() {
  const dirents = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
  return dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

async function readLocaleFile(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  const candidates = ["messages.json", "message.json"].map((file) => path.join(localeDir, file));
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      const raw = await fs.readFile(candidate, "utf8");
      return JSON.parse(raw);
    } catch {
      // keep trying
    }
  }
  throw new Error(`Missing messages file for locale ${locale}`);
}

function extractLabelPhrase(entry) {
  if (!entry?.description) return "";
  const [phrase] = entry.description.split(":");
  return phrase?.trim() || "";
}

function escapeCsv(value) {
  const normalized = value == null ? "" : String(value);
  if (normalized === "") {
    return "";
  }
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function main() {
  const locales = await listLocales();
  const header = ["locale", "labelPhrase", ...TARGET_LANGUAGES.map((lang) => lang.key)];
  const rows = [header.join(",")];

  for (const locale of locales) {
    const catalog = await readLocaleFile(locale);
    const labelEntry = catalog[TARGET_LANGUAGES[0].key];
    const labelPhrase = extractLabelPhrase(labelEntry);
    const row = [escapeCsv(locale), escapeCsv(labelPhrase)];
    for (const lang of TARGET_LANGUAGES) {
      row.push(escapeCsv(catalog[lang.key]?.message ?? ""));
    }
    rows.push(row.join(","));
  }

  const content = rows.join("\n");
  await fs.writeFile(OUTPUT_PATH, `${content}\n`, "utf8");
  console.log(`Exported labels to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
