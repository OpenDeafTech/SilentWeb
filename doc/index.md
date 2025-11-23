# SilentWeb — Documentation

Bienvenue sur la documentation officielle du projet SilentWeb. Cette section est conçue pour GitHub Pages et offre une vue synthétique de l’extension, des guides d’installation et des ressources pour les contributrices et contributeurs.

## Aperçu
SilentWeb est une extension Firefox open-source qui génère des sous-titres enrichis, des transcriptions locales et des alertes visuelles afin de faciliter la navigation des personnes sourdes ou malentendantes. L’intégralité du traitement est réalisée en local pour respecter la vie privée.

## Navigation
- [Guide très simple (1.1.1)](guide-simple.md)
- [Prise en main](getting-started.md)
- [Architecture et composants](architecture.md)
- [Contribution](contributing.md)

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

Le dossier `dist/` contiendra les scripts minifiés, feuilles de style et le `manifest.json` prêt à être chargé dans Firefox.

## Questions fréquentes
**Puis-je utiliser SilentWeb sur d’autres navigateurs ?**
> L’extension cible Firefox pour l’instant. Le code est compatible Chromium à 80 %, mais nécessite des ajustements liés aux API `chrome.*`.

**Les données audio quittent-elles mon ordinateur ?**
> Non. Le traitement est exécuté côté client. SilentWeb ne transmet pas d’audio ou de transcription à un serveur tiers.

**Comment signaler un bug ?**
> Ouvrez une issue GitHub avec les étapes de reproduction, les logs de la console et votre version de Firefox.

## Licence
SilentWeb est distribué sous licence [MIT](../LICENSE).
