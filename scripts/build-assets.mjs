#!/usr/bin/env node
/**
 * Copy public assets (manifest, icons, etc.) and vendor files into dist/.
 * Ensures the Chrome bundle is self-contained after `pnpm run build`.
 */
import { cp, mkdir, copyFile, access, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const publicDir = path.resolve(rootDir, "public");
const packagePublicDir = path.resolve(rootDir, "packages", "public");

async function copyPublic() {
  try {
    await cp(publicDir, distDir, { recursive: true, force: true });
    console.log("[build:assets] Copied public/ -> dist/");
  } catch (error) {
    console.error("[build:assets] Failed to copy public/ assets", error);
    throw error;
  }

  try {
    await cp(packagePublicDir, distDir, { recursive: true, force: true });
    console.log("[build:assets] Copied packages/public/ -> dist/");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn("[build:assets] packages/public/ not found, skipping.");
    } else {
      console.error("[build:assets] Failed to copy packages/public/ assets", error);
      throw error;
    }
  }
}

async function verifyManifest() {
  const manifestPath = path.resolve(distDir, "manifest.json");
  try {
    await access(manifestPath);
    console.log("[build:assets] Found dist/manifest.json");
  } catch {
    throw new Error("dist/manifest.json is missing after assets copy. Ensure public/manifest.json or packages/public/manifest.json exists.");
  }
}

async function copyOpusRecorder() {
  const src = path.resolve(rootDir, "node_modules", "opus-recorder", "dist", "recorder.min.js");
  const destDir = path.resolve(distDir, "vendor");
  const dest = path.join(destDir, "opus-recorder.min.js");
  try {
    await access(src);
  } catch {
    console.warn("[build:assets] opus-recorder not found, skipping vendor copy.");
    return;
  }
  await mkdir(destDir, { recursive: true });
  await copyFile(src, dest);
  console.log("[build:assets] Copied opus-recorder.min.js");
}

async function copyLocales() {
  const src = path.resolve(rootDir, "_locales");
  const dest = path.resolve(distDir, "_locales");
  try {
    await rm(dest, { recursive: true, force: true });
    await cp(src, dest, { recursive: true, force: true });
    console.log("[build:assets] Copied _locales/ -> dist/_locales/");
  } catch (error) {
    console.error("[build:assets] Failed to copy _locales/ assets", error);
    throw error;
  }
}

async function ensureIcons() {
  const iconMap = [
    { src: "oreille-barree-256.png", dest: "icon-48.png" },
    { src: "oreille-barree-512.png", dest: "icon-128.png" }
  ];
  for (const { src, dest } of iconMap) {
    const from = path.resolve(distDir, src);
    const to = path.resolve(distDir, dest);
    try {
      await copyFile(from, to);
      console.log(`[build:assets] Copied ${src} -> ${dest}`);
    } catch (error) {
      console.warn(`[build:assets] Missing icon source ${src}: ${error.message}`);
    }
  }
}

await copyPublic();
await copyOpusRecorder();
await copyLocales();
await ensureIcons();
await verifyManifest();
