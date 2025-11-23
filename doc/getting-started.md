# Prise en main

Ce guide accompagne les nouvelles personnes contributrices pour installer l’environnement, lancer l’extension et vérifier qu’elle fonctionne.

## Prérequis
- **Node.js 20+**
- **pnpm 9+**
- **Firefox Developer Edition** (facultatif mais recommandé pour `web-ext run`)
- Git et un terminal compatible Bash/Zsh

Vérifiez vos versions :
```bash
node -v
pnpm -v
```

## Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/OpenDeafTech/SilentWeb.git
   cd SilentWeb
   ```
2. Installez les dépendances :
   ```bash
   pnpm install
   ```
3. Construisez les artefacts :
   ```bash
   pnpm run build
   ```

## Lancer l’extension en mode développement
Deux options :
- **Mode automatique** :
  ```bash
  pnpm run dev
  ```
  `web-ext` compile `dist/` et démarre Firefox Developer Edition avec l’extension chargée.
- **Mode manuel** :
  1. Exécutez `pnpm run build`.
  2. Ouvrez `about:debugging#/runtime/this-firefox` dans Firefox.
  3. Cliquez sur *Charger un module complémentaire temporaire* et sélectionnez `dist/manifest.json`.

## Scripts utiles
| Script | Description |
| ------ | ----------- |
| `pnpm run lint` | Vérifie le code JS/TS avec ESLint. |
| `pnpm run typecheck` | Vérifie les types TypeScript sans générer de fichiers. |
| `pnpm run test` | Lance Vitest (unit tests). |
| `pnpm run test:e2e` | Lance Playwright (tests end-to-end). |
| `pnpm run serve:e2e` | Démarre Vite sur `localhost:3000` pour les fixtures.

## Tests
1. **Unitaires** : `pnpm run test`
2. **E2E** :
   ```bash
   pnpm run serve:e2e # dans un terminal
   pnpm run test:e2e  # dans un autre
   ```

## Dépannage rapide
- **`web-ext` ne trouve pas Firefox** : installez Firefox Developer Edition et assurez-vous qu’il se situe dans le PATH.
- **Erreur Playwright sur les binaires** : exécutez `npx playwright install` pour installer les navigateurs requis.
- **Problèmes de permissions** : supprimez `node_modules`, relancez `pnpm install` et vérifiez que vous n’utilisez pas `sudo`.

## Prochaines étapes
Consultez la page [Architecture](architecture.md) pour comprendre la structure des paquets et les flux de communication. Passez ensuite à la section [Contribution](contributing.md) pour connaître les conventions de code et le workflow Git.
