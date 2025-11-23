/* ============================================================================
   rollup.config.mjs
   Rollup build configuration for SilentWeb extension
   - JS bundles to dist/content/* and dist/worker/*
   - Generates .min.js variants (inject.min.js, overlay.min.js, sw.min.js)
   - Extracts styles.css and builds styles.min.css
   - Builds content/overlay.min.css from src/content/overlay.css
   - Copies public/* and vendor opus-recorder if present
   ============================================================================ */

import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-css-only";
import cssnano from "cssnano";
import fs from "fs/promises";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const telemetryFlag = process.env.ENABLE_TELEMETRY ?? "false";

function createTsPlugin() {
  return typescript({
    tsconfig: "./tsconfig.json",
    compilerOptions: {
      sourceMap: !isProd,
      declaration: false,
      declarationMap: false,
    },
  });
}

/* Map entry -> output path */
function entryPath(name, { min = false } = {}) {
  if (name === "background") return `worker/sw${min ? ".min" : ""}.js`;
  if (name === "inject") return `content/inject${min ? ".min" : ""}.js`;
  if (name === "overlay") return `content/overlay${min ? ".min" : ""}.js`;
  return `js/${name}${min ? ".min" : ""}.js`;
}

/* Create styles.min.css from dist/styles.css */
function minifyCssCopy({ src = "dist/styles.css", dest = "dist/styles.min.css" } = {}) {
  return {
    name: "minify-css-copy",
    async writeBundle() {
      const cssIn = await fs.readFile(src, "utf8");
      const { default: postcss } = await import("postcss");
      const { css: out } = await postcss([cssnano()]).process(cssIn, { from: undefined });
      await fs.writeFile(dest, out, "utf8");
      this.warn(`Created ${path.basename(dest)}`);
    },
  };
}

/* Build dist/content/overlay.min.css from src/content/overlay.css */
function buildOverlayMinCss({
  src = "src/content/overlay.css",
  dest = "dist/content/overlay.min.css",
} = {}) {
  return {
    name: "overlay-min-css",
    async writeBundle() {
      try {
        const cssIn = await fs.readFile(src, "utf8");
        const { default: postcss } = await import("postcss");
        const { css: out } = await postcss([cssnano()]).process(cssIn, { from: undefined });
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, out, "utf8");
        this.warn(`Created ${path.relative(process.cwd(), dest)}`);
      } catch (e) {
        this.warn(`overlay-min-css skipped (${e.message})`);
      }
    },
  };
}

/* Copy vendor if it exists (no error if missing) */
function copyIfExists({ src, dest, rename: toName }) {
  return {
    name: "copy-if-exists",
    async writeBundle() {
      try {
        await fs.access(src);
      } catch {
        this.warn(`Vendor missing: ${src} (skipped)`);
        return;
      }
      const targetDir = dest;
      const base = toName || path.basename(src);
      await fs.mkdir(targetDir, { recursive: true });
      await fs.copyFile(src, path.join(targetDir, base));
      this.warn(`Copied ${base} -> ${targetDir}`);
    },
  };
}

/* Base (unminified) build */
const baseConfig = {
  input: {
    inject: "src/content/inject.ts",
    overlay: "src/content/overlay.ts",
    background: "src/worker/background.ts",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: (chunk) => entryPath(chunk.name),
    chunkFileNames: "js/[name]-[hash].js",
    sourcemap: !isProd,
  },
  plugins: [
    resolve({ browser: true, extensions: [".js", ".ts", ".tsx"] }),
    commonjs(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
      __ENABLE_TELEMETRY__: JSON.stringify(telemetryFlag),
    }),
    createTsPlugin(),
    css({ output: "styles.css" }),
    minifyCssCopy({ src: "dist/styles.css", dest: "dist/styles.min.css" }),
    buildOverlayMinCss({
      src: "src/content/overlay.css",
      dest: "dist/content/overlay.min.css",
    }),
    copy({
      targets: [{ src: "public/*", dest: "dist" }],
      hook: "writeBundle",
    }),
    copyIfExists({
      src: "node_modules/opus-recorder/dist/recorder.min.js",
      dest: "dist/vendor",
      rename: "opus-recorder.min.js",
    }),
  ],
  treeshake: isProd,
};

/* Minified JS build (.min.js alongside) */
const minConfig = {
  input: baseConfig.input,
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: (chunk) => entryPath(chunk.name, { min: true }),
    chunkFileNames: "js/[name]-[hash].min.js",
    sourcemap: false,
  },
  plugins: [
    resolve({ browser: true, extensions: [".js", ".ts", ".tsx"] }),
    commonjs(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production"),
      __ENABLE_TELEMETRY__: JSON.stringify(telemetryFlag),
    }),
    createTsPlugin(),
    terser(),
  ],
  treeshake: true,
};

export default defineConfig([baseConfig, minConfig]);
