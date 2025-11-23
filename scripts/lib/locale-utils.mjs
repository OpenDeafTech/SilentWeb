#!/usr/bin/env node

/**
 * Shared helpers for working with `_locales/<lang>/(messages|message).json`.
 * These functions are used by the locale QA/reporting scripts so we keep the
 * file-system logic in one place.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT = path.resolve(__dirname, "../..");
export const LOCALES_DIR = path.join(ROOT, "_locales");
export const LOCALE_FILE_CANDIDATES = ["messages.json", "message.json"];

export async function listLocales() {
  const dirents = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
  return dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

export async function resolveLocaleFile(locale) {
  const baseDir = path.join(LOCALES_DIR, locale);
  for (const candidate of LOCALE_FILE_CANDIDATES) {
    const candidatePath = path.join(baseDir, candidate);
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // Try the next candidate.
    }
  }
  throw new Error(`Missing messages.json for locale ${locale}`);
}

export async function readLocale(locale) {
  const filePath = await resolveLocaleFile(locale);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Locale file ${filePath} should contain a JSON object.`);
  }
  return { locale, filePath, messages: parsed };
}

export function extractKeys(messages) {
  return Object.keys(messages).sort();
}

export function getReferenceLocale(locales, preferred = "en") {
  if (locales.includes(preferred)) {
    return preferred;
  }
  if (locales.length === 0) {
    throw new Error("No locales available.");
  }
  return locales[0];
}

export function formatPercentage(current, total) {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round((current / total) * 100)}%`;
}
