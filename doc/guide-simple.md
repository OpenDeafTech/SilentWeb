# SilentWeb 1.4.2 — Guide très simple

Ce document explique SilentWeb avec des mots du quotidien. Il peut être lu par toute personne, même sans connaissance informatique. Prenez le temps de suivre chaque étape tranquillement.

## 1. À quoi sert SilentWeb ?

- Afficher des sous-titres sur les vidéos ou les réunions en ligne.
- Montrer une petite barre (appelée « overlay ») avec les actions principales.
- Prévenir par de la lumière ou du texte lorsqu’un son important est détecté.
- Tout se passe **sur votre ordinateur** : aucun son n’est envoyé sur Internet.

## 2. Ce qu’il faut avant de commencer

1. Un ordinateur avec Firefox (version récente).
2. Une connexion Internet pour télécharger l’extension.
3. Le fichier "SilentWeb 1.4.2" disponible sur la page « Releases » de GitHub ou fourni par votre association.

## 3. Installer pas à pas

1. Téléchargez l’archive `silentweb-1.4.2.zip` depuis la page de publication.
2. Dézippez le fichier si nécessaire : vous obtenez un dossier `SilentWeb`.
3. Ouvrez Firefox et tapez `about:debugging#/runtime/this-firefox` dans la barre d’adresse.
4. Cliquez sur **« Charger un module complémentaire temporaire »** puis choisissez le fichier `manifest.json` à l’intérieur du dossier `SilentWeb`.
5. Firefox affiche l’icône SilentWeb près de la barre d’adresse : l’installation est terminée.

> Astuce : pour garder SilentWeb après un redémarrage, vous pouvez empaqueter l’extension (`pnpm run build` puis charger le dossier `dist/`) ou attendre la publication officielle sur le store Firefox.

## 4. Utiliser SilentWeb au quotidien

1. Ouvrez la page avec vidéo, audio ou visioconférence.
2. Cliquez sur l’icône SilentWeb. Une barre sombre apparaît en haut de l’écran : c’est l’overlay.
3. Appuyez sur **« Activer les sous-titres »** pour afficher les textes.
4. Appuyez sur **« Désactiver les sous-titres »** pour les cacher.
5. Le bouton **« Toggle overlay »** permet de masquer ou montrer la barre à tout moment.

Vous pouvez continuer à naviguer normalement. SilentWeb ne modifie pas vos mots de passe ni vos favoris.

## 5. Comprendre les voyants

- Barre visible et texte blanc : SilentWeb écoute et peut afficher des sous-titres.
- Barre grise ou masquée : cliquez sur l’icône SilentWeb pour la réactiver.
- Aucun son n’apparaît : vérifiez que le site diffuse bien de l’audio ou que votre volume n’est pas muet.

## 6. Résoudre un problème

- Si l’overlay ne s’affiche pas, rechargez la page (`Ctrl + R` ou `Cmd + R`).
- Si la traduction est lente, fermez les autres onglets gourmands (streaming, jeux, etc.).
- Pour demander de l’aide humaine, ouvrez l’onglet « Issues » sur GitHub et décrivez la situation avec vos mots.

## 7. Rappel pour tous

- SilentWeb 1.4.2 est un premier pas. Les futures versions seront encore plus simples.
- Vous pouvez partager ce guide avec toute personne ayant besoin de sous-titres rapides.
- Merci de soutenir ce projet libre pensé pour tous les âges.

## 8. Et si je veux aider à traduire ?

- Regardez la page `docs/locales-status.md` sur GitHub : elle liste les langues à prioriser et la personne qui relit.
- Lancez `pnpm run locales:pipeline` pour obtenir un fichier CSV avec les textes à traduire (le fichier `locales-language-labels.csv` reste la base à jour).
- Suivez le “Translation Playbook” (`doc/translation-playbook.md`) qui explique le ton à utiliser, les mots à éviter et les tests (`pnpm run locales:lint`, `pnpm exec vitest …`).
- Quand tout est prêt, exécutez `pnpm run locales:update` pour remettre les traductions dans les fichiers `_locales/` puis demandez une relecture.
