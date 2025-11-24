#!/usr/bin/env node

/**
 * Generate docs/locales-status.md with coverage metrics, reviewers and QA issues.
 */

import { promises as fs } from "fs";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

import {
  listLocales,
  resolveLocaleFile,
  getReferenceLocale,
} from "./lib/locale-utils.mjs";
import { lintLocales } from "./locales-lint.mjs";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");
const OUTPUT_FILE = path.join(DOCS_DIR, "locales-status.md");
const METADATA_FILE = path.join(ROOT, "locales-metadata.json");

async function loadMetadata() {
  try {
    const raw = await fs.readFile(METADATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      defaultReviewer: "Unassigned",
      locales: {},
    };
  }
}

async function getLastUpdatedDate(locale) {
  try {
    const { stdout } = await execFileAsync("git", ["-C", ROOT, "log", "-1", "--format=%cs", "--", `_locales/${locale}`]);
    const trimmed = stdout.trim();
    if (trimmed) {
      return trimmed;
    }
  } catch {
    // Fallback to fs stat below.
  }

  try {
    const filePath = await resolveLocaleFile(locale);
    const stats = await fs.stat(filePath);
    return stats.mtime.toISOString().slice(0, 10);
  } catch {
    return "N/A";
  }
}

function summarizeIssues(issues = []) {
  if (!issues.length) {
    return "—";
  }
  const counts = new Map();
  for (const issue of issues) {
    const key = `${issue.type}:${issue.severity}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const entries = [...counts.entries()]
    .map(([key, count]) => {
      const [type, severity] = key.split(":");
      return `${type} (${severity}×${count})`;
    })
    .join(", ");
  return entries || "—";
}

function formatCoverage(translated, total) {
  if (total === 0) return "0%";
  const percentage = Math.round((translated / total) * 100);
  return `${percentage}% (${translated}/${total})`;
}

function buildLocaleSection(locale, stats, reviewer, lastUpdated, issues, notes) {
  const header = `### ${locale}\n`;
  const statusLine = issues.length ? "- Problèmes détectés:" : "- Problèmes détectés: aucun";
  const lines = [
    `- Couverture: ${formatCoverage(stats.translatedKeys, stats.totalKeys)}`,
    `- Dernière mise à jour: ${lastUpdated}`,
    `- Reviewer assigné: ${reviewer}`,
    notes ? `- Notes: ${notes}` : null,
    statusLine,
  ].filter(Boolean);

  const details = issues
    .map((issue) => `  - [${issue.severity}] ${issue.key}: ${issue.message}`)
    .join("\n");

  return `${header}${lines.join("\n")}${issues.length ? `\n${details}` : ""}\n`;
}

async function main() {
  const metadata = await loadMetadata();
  const locales = await listLocales();
  if (!locales.length) {
    console.warn("No locales detected. Nothing to report.");
    return;
  }

  const referenceLocale = metadata.referenceLocale || getReferenceLocale(locales);
  const lintResult = await lintLocales({ referenceLocale });
  const issuesByLocale = new Map();
  for (const issue of lintResult.issues) {
    if (!issuesByLocale.has(issue.locale)) {
      issuesByLocale.set(issue.locale, []);
    }
    issuesByLocale.get(issue.locale).push(issue);
  }

  const localeDocs = [];
  const tableRows = [];

  for (const locale of locales) {
    const stats = lintResult.stats.get(locale);
    if (!stats) continue;
    const localeMetadata = metadata.locales?.[locale] || {};
    const reviewer = localeMetadata.reviewer || metadata.defaultReviewer || "Unassigned";
    const notes = localeMetadata.notes || "";
    const lastUpdated = await getLastUpdatedDate(locale);
    const localeIssues = issuesByLocale.get(locale) || [];
    const anomalies = summarizeIssues(localeIssues);
    tableRows.push(
      `| ${locale} | ${formatCoverage(stats.translatedKeys, stats.totalKeys)} | ${lastUpdated} | ${reviewer} | ${localeIssues.length} | ${anomalies} |`
    );
    localeDocs.push(buildLocaleSection(locale, stats, reviewer, lastUpdated, localeIssues, notes));
  }

  const generatedAt = new Date().toISOString();

  const navInclude = "{% include nav.md %}";

  const content = `---
layout: default
title: Tableau de bord des locales
---

${navInclude}

<!-- This file is auto-generated via \`pnpm run locales:report\`. -->
# Tableau de bord des locales

- Référence: ${lintResult.referenceLocale}
- Dernière génération: ${generatedAt}
- Source: \`scripts/locales-report.mjs\`

| Locale | Couverture | Dernière mise à jour | Reviewer | Nb. issues | Anomalies |
| --- | --- | --- | --- | --- | --- |
${tableRows.join("\n")}

## Détails

${localeDocs.join("\n")}
`;

  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, content, "utf8");
  console.log(`Locales report generated -> ${path.relative(ROOT, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
