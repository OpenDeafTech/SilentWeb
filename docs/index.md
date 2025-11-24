---
layout: default
---

# SilentWeb — Documentation centrale

Bienvenue sur la page d’accueil de SilentWeb. Tout est regroupé ici : installation, usage quotidien, contribution, traduction, architecture et sécurité, avec des liens directs vers les ressources clés.

## Accès rapides
- Code et binaires : [Dépôt GitHub](https://github.com/OpenDeafTech/SilentWeb) · [Releases](https://github.com/OpenDeafTech/SilentWeb/releases) · [Licence MIT](../LICENSE)
- Support et suivi : [Issues](https://github.com/OpenDeafTech/SilentWeb/issues) · [Roadmap](./roadmap.md) · [Vision](./vision.md) · [Statut des locales](./locales-status.md)
- Sommaire : [Installer](#installer-silentweb) · [Utiliser](#utiliser-en-30-secondes) · [Fonctionnalites](#fonctionnalites-principales) · [Contribuer](#contribuer-et-tester) · [Traduire](#traduire) · [Architecture](#architecture-et-design) · [Securite](#securite-et-qualite) · [Ressources](#ressources-annexes)

## Aperçu rapide
SilentWeb est une extension Firefox/Chrome open-source qui affiche des sous-titres enrichis, génère des transcriptions locales et déclenche des alertes visuelles. Tout le traitement reste sur votre machine pour préserver la vie privée et fonctionner hors ligne.

## Installer SilentWeb {#installer-silentweb}
### Prérequis
- Firefox 109+ ou Chrome 114+ pour charger l’extension.
- Pour construire depuis la source : Node.js ≥ 20 et pnpm ≥ 9.

### Depuis une release (utilisateur)
1. Téléchargez `silentweb-*.zip` depuis la page [Releases](https://github.com/OpenDeafTech/SilentWeb/releases).
2. Décompressez le fichier pour obtenir le dossier `SilentWeb`.
3. Dans Firefox, ouvrez `about:debugging#/runtime/this-firefox` puis **Charger un module complémentaire temporaire** et sélectionnez `manifest.json`.
   - Chrome/Edge : `chrome://extensions` → activer le mode développeur → **Charger l’extension non empaquetée** → dossier `SilentWeb`.

### Depuis la source (contribution)
```bash
git clone https://github.com/OpenDeafTech/SilentWeb.git
cd SilentWeb
pnpm install
pnpm run build
```
Le dossier `dist/` contient le bundle MV3 prêt à être chargé via `about:debugging` ou `chrome://extensions`.

## Utiliser en 30 secondes {#utiliser-en-30-secondes}
1. Ouvrez une page avec audio/vidéo ou visioconférence.
2. Cliquez sur l’icône SilentWeb pour afficher l’overlay.
3. Appuyez sur **Activer les sous-titres** pour afficher la transcription en direct.
4. Masquez/affichez l’overlay avec **Toggle overlay**.
5. Vérifiez le volume de la page si rien ne s’affiche.

## Fonctionnalités principales {#fonctionnalites-principales}
- Transcription locale en temps réel (audio + OCR selon le contexte).
- Sous-titres enrichis : thèmes, tailles et couleurs configurables.
- Alertes visuelles déclenchées par mots-clés, volume ou événements réseau.
- Panneau d’options pour gérer profils, langues, raccourcis et apparence.
- Localisation multi-langues via `_locales/` et scripts d’automatisation.

## Contribuer et tester {#contribuer-et-tester}
- Lisez le guide [Contributing](./contributing.md) pour les règles de style et de revue.
- Commandes utiles : `pnpm run lint`, `pnpm test` (Vitest), `pnpm run test:e2e` (Playwright), `pnpm run validate:locales`.
- Pour packager : `pnpm run release` crée `web-ext-artifacts/` après la suite QA (`ci:test`).
- Signalez les bugs via une [issue GitHub](https://github.com/OpenDeafTech/SilentWeb/issues) avec étapes de reproduction et logs.

## Traduire {#traduire}
- Consultez le [Translation Playbook](./translation-playbook.md) pour le ton et les tests.
- Priorisez les langues via le [Tableau des locales](./locales-status.md).
- Pipeline rapide : `pnpm run locales:pipeline` → traduire le CSV → `pnpm run locales:lint` → `pnpm run locales:update`.

## Architecture et design {#architecture-et-design}
- Vue d’ensemble technique dans [architecture.md](./architecture.md) et l’arborescence du repo dans [arborescence.md](./arborescence.md).
- Intentions UI et règles d’accessibilité détaillées dans [design-ui.md](./design-ui.md).

## Sécurité et qualité {#securite-et-qualite}
- Modèles et pratiques dans [security-templates.md](./security-templates.md).
- Tests automatisés : Vitest pour l’unité, Playwright pour l’E2E (`pnpm run test:e2e`), audits locaux via `pnpm audit --prod`.

## Ressources annexes {#ressources-annexes}
- Guides complets : [Guide très simple](./guide-simple.md) (pas-à-pas non technique) et [Getting started](./getting-started.md) (profil dev).
- Organisation du projet : [Roadmap](./roadmap.md) et [Vision](./vision.md).
- Licence : SilentWeb est distribué sous licence [MIT](../LICENSE).
