#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const ARTIFACTS_DIR = path.resolve('packages/extension/web-ext-artifacts');
const OUT_DIR = path.resolve('.');

async function main() {
  try {
    const files = await fs.readdir(ARTIFACTS_DIR);
    const firefoxZip = files.find(f => /^silentweb-[0-9].*\.zip$/.test(f) && !/chrome/.test(f));
    const chromeZip = files.find(f => /chrome.*\.zip$/.test(f));

    if (!firefoxZip && !chromeZip) {
      console.error('Aucun artefact trouvé dans', ARTIFACTS_DIR);
      process.exitCode = 1;
      return;
    }

    if (firefoxZip) {
      const src = path.join(ARTIFACTS_DIR, firefoxZip);
      const destZip = path.join(OUT_DIR, firefoxZip);
      await fs.copyFile(src, destZip);
      // create a .xpi alongside the zip for convenience (same bytes)
      const xpiName = firefoxZip.replace(/\.zip$/i, '.xpi');
      const destXpi = path.join(OUT_DIR, xpiName);
      await fs.copyFile(src, destXpi);
      console.log('Copied Firefox package to', destZip, 'and', destXpi);
    }

    if (chromeZip) {
      const src = path.join(ARTIFACTS_DIR, chromeZip);
      const dest = path.join(OUT_DIR, chromeZip);
      await fs.copyFile(src, dest);
      console.log('Copied Chrome package to', dest);
    }
  } catch (err) {
    console.error('Erreur lors de la copie des artefacts:', err);
    process.exitCode = 2;
  }
}

main();
