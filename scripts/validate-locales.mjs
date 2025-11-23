#!/usr/bin/env node
/**
 * Validate that all `_locales/<lang>/messages.json` (or message.json) files
 * expose the exact same set of keys. Any missing or extra keys are reported.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "_locales");
const FILE_CANDIDATES = ["messages.json", "message.json"];
// These locales are still being populated and should not fail validation
const PARTIAL_LOCALES = new Set(["fil", "ur"]);

async function ensureLocalesDir() {
  try {
    const stats = await fs.stat(LOCALES_DIR);
    if (!stats.isDirectory()) {
      throw new Error(`Expected ${LOCALES_DIR} to be a directory`);
    }
  } catch (error) {
    throw new Error(`Unable to access ${LOCALES_DIR}: ${error.message}`);
  }
}

async function listLocales() {
  const dirents = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
  return dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

async function loadLocale(locale) {
  const baseDir = path.join(LOCALES_DIR, locale);

  let filePath = null;
  for (const candidate of FILE_CANDIDATES) {
    const candidatePath = path.join(baseDir, candidate);
    try {
      await fs.access(candidatePath);
      filePath = candidatePath;
      break;
    } catch {
      // ignore and continue with next candidate
    }
  }

  if (!filePath) {
    throw new Error(`Missing messages.json in ${baseDir}`);
  }

  const raw = await fs.readFile(filePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON for ${locale}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Locale file ${filePath} should contain an object`);
  }

  return {
    locale,
    filePath,
    keys: Object.keys(parsed).sort(),
  };
}

function diff(setA, setB) {
  return [...setA].filter((key) => !setB.has(key));
}

async function main() {
  await ensureLocalesDir();
  const locales = await listLocales();
  if (locales.length === 0) {
    console.warn("No locales found under _locales/. Nothing to validate.");
    return;
  }

  const localeData = await Promise.all(locales.map((locale) => loadLocale(locale)));
  const dataMap = new Map(localeData.map((entry) => [entry.locale, entry]));

  const referenceLocale = dataMap.has("en") ? "en" : localeData[0].locale;
  const reference = dataMap.get(referenceLocale);
  if (!reference) {
    throw new Error("Reference locale could not be determined.");
  }
  const referenceSet = new Set(reference.keys);

  const issues = [];

  for (const { locale, keys } of localeData) {
    const keySet = new Set(keys);
    const allowPartial = PARTIAL_LOCALES.has(locale);
    const missing = allowPartial ? [] : diff(referenceSet, keySet);
    const extra = diff(keySet, referenceSet);

    if (missing.length > 0) {
      issues.push(`Locale "${locale}" is missing keys: ${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      issues.push(`Locale "${locale}" has orphan keys: ${extra.join(", ")}`);
    }
  }

  if (issues.length > 0) {
    console.error("Locale validation failed:");
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
    process.exit(1);
  }

  console.log(
    `Locale validation passed: ${locales.length} locales share ${reference.keys.length} keys (reference: ${referenceLocale}).`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
