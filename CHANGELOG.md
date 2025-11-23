# Changelog

Tous les changements notables de SilentWeb seront documentés ici.
Ce fichier suit librement le format "Keep a Changelog" et s'appuie sur le versionnement sémantique.

## [1.4.6] - 2025-12-12

### Fixed

- Le build copie désormais automatiquement `public/` (manifest, icônes) et les dépendances `opus-recorder` vers `dist/`, crée les entrées `icon-48.png`/`icon-128.png` attendues par le manifest et pointe ce dernier sur les fichiers minifiés réellement générés. Le paquet obtenu peut être chargé tel quel dans Google Chrome sans manipulations manuelles.

## [1.4.5] - 2025-12-12

### Added

- Compatibilité 100 % Google Chrome : l’extension est désormais buildée/testée sur Chromium (Playwright) et peut être empaquetée pour le Chrome Web Store sans modification supplémentaire.

### Fixed

- Les workflows GitHub (`ci.yml`, `perf.yml`, `release.yml`) passent désormais `package_json_file: package.json` à `pnpm/action-setup@v4` pour que l’action récupère automatiquement la version définie dans `packageManager` sans divergence.
- Les workflows GitHub (`ci.yml`, `perf.yml`, `release.yml`) ne forcent plus `pnpm@9` côté action `pnpm/action-setup@v4`, ce qui supprime l’erreur “Multiple versions of pnpm specified” apparue lors de l’installation (le runner lit désormais uniquement `packageManager: pnpm@9.12.0`).
- Le pipeline de release retrouve un comportement déterministe : l’auto-installer pnpm n’est plus redéclenché avec une version incohérente, ce qui évite les échecs précoces et garantit l’exécution de `pnpm install --frozen-lockfile`.

## [1.4.4] - 2025-12-11

### Changed

- ESLint bascule sur le parser `typescript-eslint` pour traiter `*.ts`/`*.tsx` avec les mêmes règles d'import et de nettoyage que le JavaScript, ce qui évite les faux positifs sur `bus.ts`, `browser.ts`, etc. et renforce l'analyse des content scripts.

### Fixed

- Le hook `pnpm exec eslint --fix` ne plante plus : les dépendances `globals` et `typescript-eslint` sont désormais déclarées dans `package.json`, ce qui supprime l'erreur “Cannot find package 'globals'” et les erreurs de parsing TypeScript lors des pre-commit/CI.

## [1.4.3] - 2025-12-10

### Fixed

- Service worker build restauré : ajout de `packages/extension/src/worker/background.ts` pour exposer `initWorker()` et permettre à Rollup de générer `worker/sw.js` sans erreur d’entrée.
- Configuration TypeScript harmonisée (`packages/extension/tsconfig.json`, `rollup.config.mjs`) afin d’éviter les avertissements sur les types manquants (`fs-extra`, `glob`, etc.) et respecter les contraintes `outDir`/`sourcemap`.
- Paquet extension enrichi avec les dépendances PostCSS/CSSNano nécessaires aux plugins de minification, garantissant un `pnpm --filter @silentweb/extension build` fonctionnel.

## [1.4.2] - 2025-12-09

- Pipeline de traduction assisté (`pnpm run locales:pipeline`) qui exporte le CSV source, génère les CSV “pending” par locale, versionne les prompts LLM et orchestre la pré-traduction TM/LLM.
- Lint dédié (`pnpm run locales:lint`) pour vérifier placeholders, règles ICU, traductions manquantes et variations de longueur, couplé au tableau de bord auto-généré `docs/locales-status.md`.
- Tableau de bord traducteurs (`pnpm run locales:report`) avec couverture par langue, reviewer et anomalies, publié sur GitHub Pages.
- Connecteur TMS lecture seule (`pnpm run locales:sync`) basé sur `locales-tms.config.json` pour tirer les mises à jour depuis Lokalise/Crowdin/Smartling sans perdre la source Git.
- Playbook détaillé (`doc/translation-playbook.md`) + prompt LLM versionné (`translations/prompts/llm-base.md`) pour cadrer ton, terminologie inclusive et procédure d’escalade.

### Changed

- Documentation (README, doc/contributing.md, doc/guide-simple.md) mise à jour pour refléter le pipeline CSV → TM/LLM → QA automatisée (`locales:lint`, snapshot Vitest, Playwright i18n).
- `scripts/sync-language-labels.mjs` lit désormais `locales-language-labels.csv` comme source de vérité pour injecter les traductions/labelPhrase dans `_locales/**`.

## [1.3.2] - 2025-12-09

### Added

- Script `pnpm run locales:export` pour extraire les libellés de langues en CSV/TSV et faciliter le travail des traducteurs.
- Fichier `locales-overrides.json` consommé par `pnpm run locales:update` pour surcharger les traductions ou les descriptions lorsqu’`Intl.DisplayNames` ne suffit pas.

### Changed

- Documentation mise à jour pour détailler le workflow de mise à jour/snapshot des locales.
- Pipeline CI exécute désormais `pnpm run ci:test` afin de valider automatiquement les snapshots de locales.
- Guide `doc/contributing.md` enrichi pour rappeler l'exécution des scripts `locales:update`, `locales:export` et la régénération des snapshots avant chaque PR.

## [1.2.2] - 2025-12-09

### Added

- Ajout des dernières locales européennes manquantes (albanais, arménien, bélarusse, bosnien, islandais, luxembourgeois) afin de couvrir tous les pays du continent.
- Ajout des langues les plus parlées au monde (penjabi, télougou, swahili, javanais) pour garantir une expérience localisée aux communautés majeures hors d'Europe.
- Traduction des libellés « anglais, français, espagnol, portugais, allemand, italien » dans l'ensemble des fichiers de localisation pour harmoniser l'interface.
- Script `pnpm locales:update` pour synchroniser automatiquement ces libellés/descriptions et snapshots Vitest dédiés afin de prévenir toute régression sur `_locales/**`.

## [1.1.2] - 2025-12-05

### Added

- Ajout de nouvelles locales européennes (catalan, estonien, basque, galicien, géorgien, lituanien, letton, macédonien, irlandais, maltais, slovaque, slovène) pour étendre la couverture aux principales langues régionales.

## [1.1.1] - 2025-12-02

### Added

- Ajout de nouvelles traductions (`_locales/**/messages.json`) pour couvrir davantage de langues et faciliter le déploiement international de SilentWeb.

## [1.1.0] - 2025-12-01

### Added

- Automatisation de la release via GitHub Actions (`.github/workflows/release.yml`) pour produire des bundles signés et homogènes.
- Guides sécurité enrichis avec des modèles de manifest/CSP afin d'accélérer les revues et d'offrir une référence 1.1.0.

### Changed

- Synchronisation de toutes les versions (manifest, paquets, documentation) sur `1.1.0` pour refléter les évolutions depuis la sortie initiale.
- Checklist contribution mise à jour pour inclure les liens vers les templates sécurité lors des changements de manifest/CSP.

## [1.0.0] - 2025-11-23

### Added

- Première version publique de l'extension Firefox SilentWeb avec transcription locale, sous-titres enrichis et alertes visuelles configurables.
- Interface d'options, stockage persistant et thèmes préconfigurés pour personnaliser l'expérience utilisateurs sourds/malentendants.
- Infrastructure multi-paquets (core, UI, extension) avec scripts de build (`pnpm`) et distribution minifiée (content scripts, service worker, overlay).
- Suite de tests incluant Vitest (unitaires) et Playwright (E2E), plus fixtures HTML/VTT dédiées.
- Localisation initiale avec catalogues de chaînes `_locales/` pour de nombreuses langues.

### Fixed

- Normalisation Unicode des textes (guillemets, espaces insécables) afin de garantir des transcriptions cohérentes côté core.
- Harmonisation de l'API `inspectElement`/`highlightElement` pour supporter à la fois l'injection DOM et la communication `chrome.tabs`.
- Mock Chrome de tests mis à niveau pour refléter fidèlement `chrome.storage.local` (`set/get/remove`) et simplifier les assertions Vitest.
- Configuration Vitest nettoyée pour ne pas collecter les tests Playwright lors des runs unitaires (`tests/e2e/**` exclus).
