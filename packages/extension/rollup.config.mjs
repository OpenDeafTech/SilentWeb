import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-css-only";

export default defineConfig({
  input: {
  inject: "src/content/inject.ts",
  overlay: "src/content/overlay.ts",
  background: "src/worker/background.ts"
},
output: {
  dir: "dist",
  format: "esm",
  entryFileNames: "js/[name].js",
  // ...
}chat gpt,
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    replace({ preventAssignment: true, "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development") }),
    typescript({ tsconfig: "./tsconfig.json" }),
    css({ output: "styles.css" }),
    copy({ targets: [{ src: "public/*", dest: "dist" }] }),
    terser()
  ]
});
