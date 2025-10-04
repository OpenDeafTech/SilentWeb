/* ============================================================================
   tools/copy-opus.js
   Utility script to copy .opus audio files into dist/audio
   ============================================================================ */

import * as fs from "node:fs";
import * as path from "node:path";

const SRC_DIR = path.resolve("assets/audio");
const DEST_DIR = path.resolve("dist/audio");

// Ensure destination directory exists
fs.mkdirSync(DEST_DIR, { recursive: true });

// Copy all .opus files
fs.readdirSync(SRC_DIR)
  .filter((file) => file.endsWith(".opus"))
  .forEach((file) => {
    const srcPath = path.join(SRC_DIR, file);
    const destPath = path.join(DEST_DIR, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  });

console.log("All .opus files copied.");
