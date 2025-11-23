# SilentWeb

Extension Firefox et Google Chrome open-source qui rend le Web plus accessible aux personnes sourdes ou malentendantes grâce aux sous-titres enrichis, à la transcription locale et aux alertes visuelles personnalisables.

---

## Sommaire

1. [Pourquoi SilentWeb ?](#pourquoi-silentweb-)
2. [Fonctionnalités clés](#fonctionnalités-clés)
3. [Prérequis](#prérequis)
4. [Installation rapide](#installation-rapide)
5. [Scripts PNPM utiles](#scripts-pnpm-utiles)
6. [Tests et qualité](#tests-et-qualité)
7. [Charger l’extension dans Firefox](#charger-lextension-dans-firefox)
8. [Structure du projet](#structure-du-projet)
9. [Contribuer](#contribuer)
10. [Ressources](#ressources)

---

## Pourquoi SilentWeb ?

De nombreux contenus vidéo ou audio restent inaccessibles. SilentWeb répond à ce problème avec une approche simple :

- tout fonctionne en local, aucune donnée sensible n’est envoyée vers un serveur ;
- l’extension peut afficher une transcription en direct et générer des alertes visuelles selon le contexte ;
- elle est entièrement open-source, modifiable et vérifiable par la communauté.

## Fonctionnalités clés

- Transcription en temps réel (OCR + audio local selon la page).
- Sous-titres enrichis avec styles, thèmes et taille configurables.
- Alertes visuelles (flash, bannière, overlay) déclenchées par mot-clé ou niveau sonore.
- Panneau d’options pour personnaliser thèmes, raccourcis, langues et stockage.
- Support multi-langues via les fichiers `_locales/` et contributions communautaires.

## Prérequis

- **Node.js 20+** (recommandé)
- **pnpm 9+** (le projet utilise un workspace monorepo)
- Firefox Developer Edition pour le mode `web-ext run` et Google Chrome 114+ pour valider le build Chromium

Vérifiez vos versions :

```bash
node -v
pnpm -v
```

## Installation rapide

```bash
git clone https://github.com/OpenDeafTech/SilentWeb.git
cd SilentWeb
pnpm install
pnpm run build        # construit tous les artefacts dans dist/
```

L’extension prête à être chargée se trouve ensuite dans `dist/` (scripts, worker, styles, manifest) et peut être chargée telle quelle dans Firefox ou Chrome.

## Scripts PNPM utiles

| Script                  | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `pnpm run dev`          | Lance l’extension avec `web-ext` dans Firefox Dev Edition et rechargements. |
| `pnpm run build`        | Nettoie `dist/` puis construit TypeScript, content scripts, overlay et SW.  |
| `pnpm run build:chrome` | Alias de `build`, pensé pour les pipelines Chrome/Chromium (même bundle).   |
| `pnpm run test`         | Exécute la suite Vitest (unitaires, mocks).                                 |
| `pnpm run test:e2e`     | Lance les scénarios Playwright (nécessite Firefox + dépendances).           |
| `pnpm run lint`         | Vérifie le code JS/TS via ESLint.                                           |
| `pnpm run format`       | Formate le dépôt avec Prettier.                                             |
| `pnpm run typecheck`    | Vérifie les types TypeScript sans émettre de fichiers.                      |

> Astuce : utilisez `pnpm run test:watch` pour un cycle TDD rapide.

## Tests et qualité

1. **Unitaires (Vitest)** : ciblent le code commun (`src/common`, `packages/core`, etc.) et utilisent des mocks `chrome.*` fournis dans `tests/unit`.
2. **End-to-End (Playwright)** : vérifient les interactions complètes via des fixtures HTML (`tests/e2e/fixtures/*`). Chaque test suppose que `pnpm run serve:e2e` ou le serveur Vite est lancé.
3. **TypeScript** : `pnpm run typecheck` détecte les régressions de typage.
4. **Lint/Format** : gardez le dépôt propre avec `pnpm run lint` puis `pnpm run format` avant d’ouvrir une PR.

## Localisation et traductions

- `locales-language-labels.csv` est la source de vérité. Utilisez `pnpm run locales:pipeline` pour exporter les chaînes, générer les CSV “pending” par langue (`translations/pipeline/*.pending.csv`) et préparer l’ingestion TM/LLM (prompts versionnés dans [`translations/prompts/llm-base.md`](translations/prompts/llm-base.md)).
- Après pré-traduction/revue, exécutez `pnpm run locales:update` afin de réinjecter les messages dans `_locales/**` en tenant compte du CSV + des overrides (`locales-overrides.json`).
- QA automatisée : `pnpm run locales:lint` (placeholders, ICU, longueurs) puis `pnpm exec vitest run tests/unit/locales.snap.spec.ts --update` et, selon besoin, `pnpm run test:e2e --grep "@i18n"` pour valider l’affichage réel.
- Partagez l’état d’avancement via `pnpm run locales:report` qui génère `docs/locales-status.md` (tableau de bord publié sur GitHub Pages avec couverture, reviewer et anomalies).
- Connecteur TMS (lecture seule) : configurez [`locales-tms.config.json`](locales-tms.config.json) puis lancez `pnpm run locales:sync` pour tirer les traductions locales depuis Lokalise/Crowdin/Smartling avant de passer `locales:update`.
- Pour prolonger la mémoire de traduction, recourez à `pnpm run locales:export` (produit `locales-language-labels.csv`) ou éditez directement les fichiers `translations/pipeline/*.pending.csv`.
- Les règles complètes (ton, escalade, QA) sont consolidées dans [`doc/translation-playbook.md`](doc/translation-playbook.md). Merci de suivre ce guide et de ping le reviewer indiqué dans [`locales-metadata.json`](locales-metadata.json) avant toute fusion.

## Télémetrie (QA uniquement)

- Exportez le flag `ENABLE_TELEMETRY=true` lorsque vous lancez `pnpm run dev` ou `pnpm run build`. Le bundler injecte alors un mode trace dans le service worker et le worker de transcription.
- Les logs apparaissent dans la console du service worker (`[SilentWeb][telemetry] cache.hit|cache.miss|cache.store|cache.fallback`) et dans l’inspecteur du worker (`caption.duration` avec la durée en millisecondes).
- Les métriques restent anonymisées : seules des métadonnées génériques (méthode HTTP, type de ressource, durée) sont affichées.
- Vous pouvez aussi activer ponctuellement la télémétrie depuis la console du service worker (`self.ENABLE_TELEMETRY = true`) si vous ne souhaitez pas reconstruire l’extension.
- Par défaut (flag absent), aucune donnée de télémétrie n’est collectée, ce qui garantit que les utilisateurs finaux ne sont jamais concernés.

## Charger l’extension dans Firefox

1. Construisez les assets (`pnpm run build`) ou lancez `pnpm run dev` pour un rechargement auto.
2. Ouvrez `about:debugging#/runtime/this-firefox` dans Firefox.
3. Cliquez sur **Charger un module complémentaire temporaire**.
4. Sélectionnez `dist/manifest.json`.
5. L’extension apparaît immédiatement dans la barre d’outils. Relancez l’opération pour tester une nouvelle build.

## Charger l’extension dans Google Chrome

1. Construisez les assets (`pnpm run build`) ; Chrome charge directement le dossier `dist/` sans étape supplémentaire.
2. Ouvrez `chrome://extensions`.
3. Activez le **mode développeur** en haut à droite.
4. Cliquez sur **Charger l’extension non empaquetée** puis sélectionnez le dossier `dist/`.
5. SilentWeb est immédiatement disponible dans la barre d’extensions (Chrome 114+). Rechargez la page ou appuyez sur **Mettre à jour** pour tester une nouvelle build.

## Structure du projet

```
SilentWeb/
├─ packages/         # Modules partagés (core, UI, extension)
├─ src/              # Code source principal (content scripts, messaging…)
├─ tests/            # Vitest + Playwright + utilitaires
├─ public/           # Manifest et assets distribués
├─ docs/             # Documentation technique additionnelle
└─ tools/            # Scripts internes (copy, build helpers…)
```

Les fichiers `_locales/*/messages.json` contiennent les traductions affichées dans l’UI de l’extension.

## Contribuer

1. Forkez le dépôt puis créez une branche (`git checkout -b feature/ma-fonction`).
2. Développez votre amélioration et ajoutez les tests pertinents.
3. Vérifiez que tout passe (`pnpm run lint && pnpm run test`).
4. Commitez (`git commit -m "feat: description"`), poussez (`git push origin feature/ma-fonction`) et ouvrez une Pull Request.
5. Décrivez clairement le besoin, les changements et comment tester votre contribution.

Pour des idées de tâches, consultez les issues GitHub ou proposez une amélioration via Discussions.

## Ressources

- **Documentation interne** : dossier [`docs/`](docs/)
- **Changelog** : [`CHANGELOG.md`](CHANGELOG.md)
- **Licence** : [MIT](LICENSE)
- **Support / questions** : créez une issue GitHub ou contactez les maintainers via les discussions du dépôt.

Merci de contribuer à rendre le Web plus inclusif ✨
