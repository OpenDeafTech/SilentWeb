#!/usr/bin/env node

/**
 * Lint locale catalogs for placeholder mismatches, missing translations and
 * risky ICU patterns. This script is used both as a CLI ("pnpm run locales:lint")
 * and as a library by the locales dashboard.
 */

import { pathToFileURL } from "url";

import {
  listLocales,
  readLocale,
  getReferenceLocale,
  extractKeys,
} from "./lib/locale-utils.mjs";

const PLACEHOLDER_PATTERNS = [
  /\$[0-9]+/g, // $1, $2…
  /%(\d+\$)?[sd]/gi, // %s, %1$s…
  /\{[A-Z0-9_]+\}/gi, // {USERNAME}, {ID} style placeholders
];

const ICU_CATEGORY_PATTERN =
  /\b(zero|one|two|few|many|other|male|female|neutral|masculine|feminine)\s*\{/gi;

const PARTIAL_LOCALES = new Set(["fil", "ur"]);

function extractPlaceholders(message) {
  const tokens = new Set();
  if (!message) return tokens;
  for (const pattern of PLACEHOLDER_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = message.match(pattern);
    if (matches) {
      matches.forEach((match) => tokens.add(match));
    }
  }
  return tokens;
}

function analyzeIcu(message) {
  const text = message || "";
  const normalized = text.toLowerCase();
  const categories = new Set();
  let match;
  ICU_CATEGORY_PATTERN.lastIndex = 0;
  while ((match = ICU_CATEGORY_PATTERN.exec(text))) {
    categories.add(match[1].toLowerCase());
  }
  return {
    hasPlural: normalized.includes("plural,"),
    hasSelect: normalized.includes("select,"),
    categories,
  };
}

function placeholderDiff(reference, candidate) {
  const missing = [];
  const extra = [];
  for (const token of reference) {
    if (!candidate.has(token)) {
      missing.push(token);
    }
  }
  for (const token of candidate) {
    if (!reference.has(token)) {
      extra.push(token);
    }
  }
  return { missing, extra };
}

function computeLengthDelta(referenceLength, candidateLength) {
  if (referenceLength === 0) return 0;
  return Math.abs(candidateLength - referenceLength) / referenceLength;
}

function groupIssuesByLocale(issues) {
  const map = new Map();
  for (const issue of issues) {
    if (!map.has(issue.locale)) {
      map.set(issue.locale, []);
    }
    map.get(issue.locale).push(issue);
  }
  return map;
}

export async function lintLocales(options = {}) {
  const { referenceLocale: preferredReference = "en", locales: forcedLocales = null } = options;
  const locales = forcedLocales || (await listLocales());
  const referenceLocale = options.referenceLocale || getReferenceLocale(locales, preferredReference);
  const localeData = await Promise.all(locales.map((locale) => readLocale(locale)));
  const dataMap = new Map(localeData.map((entry) => [entry.locale, entry]));
  const reference = dataMap.get(referenceLocale);
  if (!reference) {
    throw new Error(`Reference locale "${referenceLocale}" is not available.`);
  }
  const referenceKeys = extractKeys(reference.messages);
  const issues = [];
  const stats = new Map();

  for (const locale of locales) {
    const entry = dataMap.get(locale);
    if (!entry) {
      continue;
    }
    const allowPartial = PARTIAL_LOCALES.has(locale);
    const localeStats = {
      totalKeys: referenceKeys.length,
      translatedKeys: 0,
      missingKeys: 0,
      issueCount: 0,
    };

    for (const key of referenceKeys) {
      const refMessage = reference.messages[key]?.message ?? "";
      const targetMessage = entry.messages[key]?.message ?? "";
      const trimmed = targetMessage.trim();
      const placeholderReference = extractPlaceholders(refMessage);
      const placeholderCandidate = extractPlaceholders(targetMessage);
      const icuReference = analyzeIcu(refMessage);
      const icuCandidate = analyzeIcu(targetMessage);

      const baseIssue = { locale, key };
      if (!trimmed) {
        if (!allowPartial || locale === referenceLocale) {
          issues.push({
            ...baseIssue,
            type: "missingTranslation",
            severity: "error",
            message: "Translation is missing or empty.",
          });
          localeStats.issueCount += 1;
        }
        localeStats.missingKeys += 1;
        continue;
      }

      localeStats.translatedKeys += 1;

      if (locale !== referenceLocale) {
        if (trimmed === refMessage.trim()) {
          issues.push({
            ...baseIssue,
            type: "unchangedTranslation",
            severity: "warning",
            message: "Translation matches the reference locale.",
          });
          localeStats.issueCount += 1;
        }

        const { missing, extra } = placeholderDiff(placeholderReference, placeholderCandidate);
        if (missing.length > 0 || extra.length > 0) {
          issues.push({
            ...baseIssue,
            type: "placeholderMismatch",
            severity: "error",
            message: `Placeholder mismatch (missing: ${missing.join(", ") || "none"}, extra: ${extra.join(
              ", "
            ) || "none"}).`,
          });
          localeStats.issueCount += 1;
        }

        if (icuReference.hasPlural && !icuCandidate.hasPlural) {
          issues.push({
            ...baseIssue,
            type: "missingPlural",
            severity: "error",
            message: "Reference string uses ICU plural rules but this translation does not.",
          });
          localeStats.issueCount += 1;
        }
        if (icuReference.hasSelect && !icuCandidate.hasSelect) {
          issues.push({
            ...baseIssue,
            type: "missingSelect",
            severity: "warning",
            message: "Reference string uses ICU select rules but this translation does not.",
          });
          localeStats.issueCount += 1;
        }

        for (const category of icuReference.categories) {
          if (!icuCandidate.categories.has(category)) {
            issues.push({
              ...baseIssue,
              type: "icuCategoryMismatch",
              severity: "error",
              message: `Missing ICU category "${category}".`,
            });
            localeStats.issueCount += 1;
          }
        }

        const lengthDelta = computeLengthDelta(refMessage.length, trimmed.length);
        const lengthThreshold = options.lengthDeltaThreshold ?? 0.65;
        if (lengthDelta > lengthThreshold) {
          issues.push({
            ...baseIssue,
            type: "lengthDelta",
            severity: "warning",
            message: `Length delta ${Math.round(lengthDelta * 100)}% exceeds threshold.`,
          });
          localeStats.issueCount += 1;
        }
      }
    }

    const localeKeys = new Set(Object.keys(entry.messages));
    for (const key of localeKeys) {
      if (!reference.messages[key]) {
        issues.push({
          locale,
          key,
          type: "orphanKey",
          severity: "warning",
          message: "Key does not exist in the reference locale.",
        });
        localeStats.issueCount += 1;
      }
    }

    stats.set(locale, localeStats);
  }

  return {
    issues,
    stats,
    referenceLocale,
    referenceKeyCount: referenceKeys.length,
  };
}

function formatIssue(issue) {
  return `[${issue.severity}] ${issue.locale} › ${issue.key} — ${issue.message}`;
}

async function runCli() {
  const args = process.argv.slice(2);
  const options = {};
  let outputFormat = "pretty";
  for (const arg of args) {
    if (arg === "--json") {
      outputFormat = "json";
    } else if (arg.startsWith("--reference=")) {
      options.referenceLocale = arg.split("=")[1];
    } else if (arg.startsWith("--length-threshold=")) {
      options.lengthDeltaThreshold = Number(arg.split("=")[1]);
    }
  }

  const result = await lintLocales(options);
  const hasErrors = result.issues.some((issue) => issue.severity === "error");

  if (outputFormat === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const grouped = groupIssuesByLocale(result.issues);
    if (result.issues.length === 0) {
      console.log("Locales lint passed with no findings.");
    } else {
      for (const [locale, localeIssues] of grouped.entries()) {
        console.log(`Locale "${locale}":`);
        localeIssues.forEach((issue) => console.log(`  - ${formatIssue(issue)}`));
      }
    }
    console.log(
      `Checked ${result.stats.size} locales (${result.referenceKeyCount} keys, reference=${result.referenceLocale}).`
    );
  }

  process.exit(hasErrors ? 1 : 0);
}

const isCli = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
