#!/usr/bin/env node

/**
 * Ensure each locale exposes localized language labels/descriptions for the
 * main world languages (English, French, Spanish, Portuguese, German, Italian).
 * This script normalizes the order of those entries, updates their translated
 * names via `Intl.DisplayNames`, and localizes the description field so it is
 * no longer hard-coded in English.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "_locales");
const OVERRIDES_PATH = path.join(ROOT, "locales-overrides.json");
const CSV_PATH = path.join(ROOT, "locales-language-labels.csv");

const TARGET_LANGUAGES = [
  { key: "langEnglish", code: "en", fallback: "English" },
  { key: "langFrench", code: "fr", fallback: "French" },
  { key: "langSpanish", code: "es", fallback: "Spanish" },
  { key: "langPortuguese", code: "pt", fallback: "Portuguese" },
  { key: "langGerman", code: "de", fallback: "German" },
  { key: "langItalian", code: "it", fallback: "Italian" },
];

const LABEL_TRANSLATIONS = {
  af: "Taal etiket",
  am: "ቋንቋ መለያ",
  ar: "تسمية اللغة",
  az: "Dil etiketi",
  be: "Моўны цэтлік",
  bg: "Езиков етикет",
  bn: "ভাষার লেবেল",
  bs: "Oznaka jezika",
  ca: "Etiqueta de la llengua",
  cs: "Jazykový štítek",
  da: "Sprogmærke",
  de: "Sprachbezeichnung",
  el: "Ετικέτα γλώσσας",
  en: "Language label",
  es: "Etiqueta de idioma",
  et: "Keelemärgis",
  eu: "Hizkuntza etiketa",
  fa: "برچسب زبان",
  fi: "Kielimerkki",
  fil: "Label ng wika",
  fr: "Étiquette de langue",
  ga: "Lipéad teanga",
  gl: "Etiqueta lingüística",
  he: "תווית שפה",
  hi: "भाषा लेबल",
  hr: "Oznaka jezika",
  hu: "Nyelvi címke",
  hy: "Լեզվի պիտակ",
  id: "Label bahasa",
  is: "Tungumálamerki",
  it: "Etichetta della lingua",
  ja: "言語ラベル",
  jv: "Label basa",
  ka: "ენის ეტიკეტი",
  ko: "언어 라벨",
  lb: "Sprooch Label",
  lt: "Kalbos etiketė",
  lv: "Valodas etiķete",
  mk: "Јазична ознака",
  mr: "भाषा लेबल",
  ms: "Label bahasa",
  mt: "Tikketta tal-lingwa",
  ne: "भाषा लेबल",
  nl: "Taallabel",
  no: "Språketikett",
  pa: "ਭਾਸ਼ਾ ਲੇਬਲ",
  pl: "Etykieta języka",
  pt: "Etiqueta de idioma",
  ro: "Etichetă de limbă",
  ru: "Языковая метка",
  sk: "Označenie jazyka",
  sl: "Jezikovna oznaka",
  sq: "Etiketa gjuhësore",
  sr: "Ознака језика",
  sv: "Språketikett",
  sw: "Lebo ya lugha",
  ta: "மொழி முத்திரை",
  te: "భాషా లేబుల్",
  th: "ป้ายชื่อภาษา",
  tr: "Dil etiketi",
  uk: "Мовна мітка",
  ur: "زبان کا لیبل",
  vi: "Nhãn ngôn ngữ",
  zh: "语言标签",
};

const intlCache = new Map();
let overrides = {
  labelPhrases: {},
  languages: {},
};
let csvOverrides = new Map();

function localeChain(locale) {
  const chain = [];
  if (locale) {
    chain.push(locale);
    if (locale.includes("-")) {
      chain.push(locale.split("-")[0]);
    }
  }
  chain.push("default");
  return [...new Set(chain)];
}

function getDisplayNames(locale) {
  if (!intlCache.has(locale)) {
    try {
      intlCache.set(
        locale,
        new Intl.DisplayNames(locale, {
          type: "language",
          fallback: "code",
        })
      );
    } catch {
      intlCache.set(locale, null);
    }
  }
  return intlCache.get(locale);
}

function getLanguageName(locale, languageCode) {
  const tried = new Set();
  let current = locale;
  while (current && !tried.has(current)) {
    tried.add(current);
    const displayNames = getDisplayNames(current);
    if (displayNames) {
      const value = displayNames.of(languageCode);
      if (value && value !== languageCode) {
        return value;
      }
    }
    if (current.includes("-")) {
      current = current.split("-")[0];
    } else if (current !== "en") {
      current = "en";
    } else {
      break;
    }
  }
  return getDisplayNames("en").of(languageCode) || languageCode;
}

function getLabelPhrase(locale) {
  const phraseOverrides = overrides.labelPhrases || {};
  for (const candidate of localeChain(locale)) {
    if (phraseOverrides[candidate]) {
      return phraseOverrides[candidate];
    }
  }
  if (LABEL_TRANSLATIONS[locale]) {
    return LABEL_TRANSLATIONS[locale];
  }
  const base = locale.split("-")[0];
  return LABEL_TRANSLATIONS[base] || LABEL_TRANSLATIONS.en;
}

function getOverrideMessage(locale, key) {
  const overrideMap = overrides.languages || {};
  for (const candidate of localeChain(locale)) {
    const entry = overrideMap[candidate];
    if (entry && entry[key]) {
      return entry[key];
    }
  }
  return null;
}

function parseCsvLine(line) {
  const values = [];
  let buffer = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        buffer += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(buffer);
      buffer = "";
      continue;
    }
    buffer += char;
  }
  values.push(buffer);
  return values.map((value) => value.trim());
}

function parseCsvOverrides(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return new Map();
  }
  const header = parseCsvLine(lines.shift());
  const localeIndex = header.indexOf("locale");
  if (localeIndex === -1) {
    throw new Error(`CSV header must contain a "locale" column.`);
  }

  const entries = new Map();
  for (const rawLine of lines) {
    const cells = parseCsvLine(rawLine);
    const locale = cells[localeIndex];
    if (!locale) {
      continue;
    }
    const data = {};
    for (let i = 0; i < header.length; i += 1) {
      const column = header[i];
      data[column] = cells[i] ?? "";
    }
    entries.set(locale, data);
  }
  return entries;
}

function getCsvValue(locale, key) {
  const row = csvOverrides.get(locale);
  if (!row) {
    return "";
  }
  const value = row[key];
  return typeof value === "string" ? value.trim() : "";
}

async function readJSON(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJSON(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, `${content}\n`, "utf8");
}

async function resolveLocaleFile(localeDir) {
  const messagesPath = path.join(localeDir, "messages.json");
  const messagePath = path.join(localeDir, "message.json");
  try {
    await fs.access(messagesPath);
    return messagesPath;
  } catch {
    await fs.access(messagePath);
    return messagePath;
  }
}

async function processLocale(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  let filePath;
  try {
    filePath = await resolveLocaleFile(localeDir);
  } catch {
    console.warn(`Skipping ${locale}: unable to locate messages file.`);
    return false;
  }
  const data = await readJSON(filePath);
  const targetKeys = new Set(TARGET_LANGUAGES.map((lang) => lang.key));
  const preservedEntries = {};

  for (const [key, value] of Object.entries(data)) {
    if (!targetKeys.has(key)) {
      preservedEntries[key] = value;
    }
  }

  for (const lang of TARGET_LANGUAGES) {
    const csvMessage = getCsvValue(locale, lang.key);
    const overrideMessage = getOverrideMessage(locale, lang.key);
    const message = csvMessage || overrideMessage || getLanguageName(locale, lang.code) || lang.fallback;
    const labelPhrase = getCsvValue(locale, "labelPhrase") || getLabelPhrase(locale);
    preservedEntries[lang.key] = {
      message,
      description: `${labelPhrase}: ${message}`,
    };
  }

  await writeJSON(filePath, preservedEntries);
  return true;
}

async function loadOverrides() {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    overrides = {
      labelPhrases: parsed.labelPhrases || {},
      languages: parsed.languages || {},
    };
  } catch {
    overrides = { labelPhrases: {}, languages: {} };
  }
}

async function loadCsv() {
  try {
    const raw = await fs.readFile(CSV_PATH, "utf8");
    csvOverrides = parseCsvOverrides(raw);
  } catch {
    csvOverrides = new Map();
  }
}

async function main() {
  await loadOverrides();
  await loadCsv();
  const dirents = await fs.readdir(LOCALES_DIR, { withFileTypes: true });
  const locales = dirents.filter((d) => d.isDirectory()).map((d) => d.name).sort();
  if (locales.length === 0) {
    console.warn("No locales found under _locales/. Nothing to sync.");
    return;
  }

  let updated = 0;
  for (const locale of locales) {
    const changed = await processLocale(locale);
    if (changed) {
      updated += 1;
    }
  }
  console.log(`Language labels synchronized for ${updated} locales.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
