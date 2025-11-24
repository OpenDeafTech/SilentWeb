---
layout: default
---

# SilentWeb — Documentation

Bienvenue sur la documentation officielle du projet SilentWeb. Cette section est conçue pour GitHub Pages et offre une vue synthétique de l’extension, des guides d’installation et des ressources pour les contributrices et contributeurs.

{% include nav.md %}

## Aperçu
SilentWeb est une extension Firefox et Google Chrome open-source qui génère des sous-titres enrichis, des transcriptions locales et des alertes visuelles afin de faciliter la navigation des personnes sourdes ou malentendantes. L’intégralité du traitement est réalisée en local pour respecter la vie privée.

## Fonctionnalités principales
- Transcription en temps réel (audio + OCR selon le contexte de la page)
- Sous-titres enrichis avec thèmes, tailles et couleurs configurables
- Alertes visuelles déclenchées par mots-clés, volume ou événements réseau
- Panneau d’options pour gérer profils, langues et raccourcis
- Localisation multi-langues via le répertoire `_locales/`

## Raccourci d’installation
```bash
git clone https://github.com/OpenDeafTech/SilentWeb.git
cd SilentWeb
pnpm install
pnpm run build
```

Le dossier `dist/` contiendra les scripts minifiés, feuilles de style et le `manifest.json` prêt à être chargé dans Firefox ou Chrome.

## Questions fréquentes
**Puis-je utiliser SilentWeb sur d’autres navigateurs ?**
> Oui. SilentWeb est supporté officiellement sur Firefox (109+) et Google Chrome (114+) avec le même bundle MV3 (`dist/`). Chargez simplement le dossier depuis `about:debugging#/runtime/this-firefox` ou `chrome://extensions`.

**Les données audio quittent-elles mon ordinateur ?**
> Non. Le traitement est exécuté côté client. SilentWeb ne transmet pas d’audio ou de transcription à un serveur tiers.

**Comment signaler un bug ?**
> Ouvrez une issue GitHub avec les étapes de reproduction, les logs de la console et votre version de Firefox.

## Licence
SilentWeb est distribué sous licence [MIT](../LICENSE).
