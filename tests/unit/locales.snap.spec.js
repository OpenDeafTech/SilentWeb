// @vitest-environment node
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.resolve(__dirname, "../../_locales");
function listLocales() {
  return fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
function readLocaleCatalog(locale) {
  const localeDir = path.join(LOCALES_DIR, locale);
  const messagesFile = fs.existsSync(path.join(localeDir, "messages.json"))
    ? path.join(localeDir, "messages.json")
    : path.join(localeDir, "message.json");
  if (!fs.existsSync(messagesFile)) {
    throw new Error(`Missing messages file for ${locale}`);
  }
  const raw = fs.readFileSync(messagesFile, "utf8");
  return sortCatalog(JSON.parse(raw));
}
function sortCatalog(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortCatalog(item));
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortCatalog(value[key]);
        return acc;
      }, {});
  }
  return value;
}
describe("locale catalogs", () => {
  const locales = listLocales();
  for (const locale of locales) {
    it(`matches snapshot for ${locale}`, () => {
      expect(readLocaleCatalog(locale)).toMatchSnapshot();
    });
  }
});
