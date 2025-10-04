// web-ext.config.js
/** @type {import('web-ext').Config} */
module.exports = {
  // Dossier de sortie après build
  sourceDir: "dist",

  // Dossier où web-ext déposera les artefacts (.zip/.xpi)
  artifactsDir: "web-ext-artifacts",

  // Fichiers/dossiers à ignorer lors du build
  ignoreFiles: [
    "**/.DS_Store",
    "**/.git/**",
    "**/.github/**",
    "**/node_modules/**",
    "**/tests/**",
    "**/*.map",
    "**/*.ts",
    "**/*.tsx",
    "**/*.tsbuildinfo",
    "**/*.log",
    "web-ext-artifacts/**",
    "dist/vendor/**"
  ],

  build: {
    overwriteDest: true
  },

  run: {
    firefox: "firefox-developer-edition", // ou "firefox" si installé
    browserConsole: true,
    startUrl: ["about:debugging#/runtime/this-firefox"],
    keepProfileChanges: true
  }
};
