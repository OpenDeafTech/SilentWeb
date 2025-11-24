---
layout: default
---

# Contribution

{% include nav.md %}

Merci de vouloir améliorer SilentWeb ! Ce guide résume les bonnes pratiques pour proposer une fonctionnalité, corriger un bug ou traduire l’interface.

## Workflow Git
1. Forkez le dépôt et créez une branche :
   ```bash
   git checkout -b feat/ma-fonction
   ```
2. Développez votre changement en adoptant les conventions suivantes :
   - TypeScript strict (`strict: true`).
   - ESLint + Prettier (exécutez `pnpm run lint` puis `pnpm run format`).
3. Ajoutez ou mettez à jour les tests associés (`pnpm run test`, `pnpm run test:e2e`).
4. Commitez en respectant le format `type: description` (ex. `feat: add live captions toggle`).
5. Poussez la branche (`git push origin feat/ma-fonction`) et ouvrez une Pull Request détaillée.

## Checklist avant PR
- [ ] `pnpm run lint`
- [ ] `pnpm run test`
- [ ] `pnpm run test:e2e` (si la fonctionnalité impacte le front)
- [ ] `pnpm run locales:update` + `pnpm exec vitest run tests/unit/locales.snap.spec.ts --update` (si des fichiers `_locales/**` changent)
- [ ] `pnpm run ci:test` (permet de rejouer la validation locales + snapshots en local avant la CI)
- [ ] Docs mises à jour (`README.md`, `CHANGELOG.md`, ou `doc/*.md`)
- [ ] Captures d’écran ou GIF si la modification touche l’UI
- [ ] Pour tout changement de `manifest.json` ou de CSP, ajoutez dans la PR un lien vers les exemples de diff / modèles de [doc/security-templates.md](./security-templates.md) afin de comparer avec la configuration de référence

## Vérifications sécurité obligatoires
Pour rester conforme aux exigences des stores (dont Mozilla AMO), chaque PR faisant évoluer le manifest, le contenu injecté ou les dépendances doit inclure une revue de sécurité courte :

- **Réduction des permissions** : inspectez `manifest.json` et vérifiez que seules les permissions strictement nécessaires sont déclarées. Documentez toute permission nouvelle dans la PR.
- **Audit CSP** : confirmez que la politique de sécurité (`content_security_policy` et en-têtes côté serveur) bloque les scripts distants non autorisés. Toute exception doit être justifiée.
- **Analyse des dépendances** : exécutez `pnpm run audit:prod` (ou `pnpm audit --prod`) pour détecter les vulnérabilités. Corrigez ou justifiez les alertes avant fusion.

Des exemples de diff manifest + modèles CSP sont disponibles dans [doc/security-templates.md](security-templates.md). Joignez les extraits pertinents dans votre PR pour accélérer la review.

Consignez les résultats (OK / actions à suivre) dans la description de la PR afin que les reviewers puissent valider rapidement.

## Traductions
1. Exécutez `pnpm run locales:pipeline --locales=fr` (adapter la locale) pour exporter `locales-language-labels.csv` et générer `translations/pipeline/<locale>.pending.csv` avec les chaînes à traduire.
2. Importez ces CSV dans votre mémoire de traduction / TMS (voir `locales-tms.config.json`) et utilisez les prompts documentés dans `translations/prompts/llm-base.md` + le [Translation Playbook](translation-playbook.md).
3. Après revue humaine, mettez à jour `locales-language-labels.csv` puis lancez `pnpm run locales:update` (source de vérité → `_locales/**`).
4. QA obligatoire : `pnpm run locales:lint`, `pnpm exec vitest run tests/unit/locales.snap.spec.ts --update`, et `pnpm run test:e2e --grep "@i18n"` pour valider l’affichage réel.
5. Publiez l’état des traductions via `pnpm run locales:report` (génère `docs/locales-status.md`) afin de partager la couverture, le reviewer et les anomalies.
6. Commitez le CSV modifié, les JSON régénérés et mettez à jour `locales-metadata.json` si le reviewer change. Pensez à ping la personne assignée dans la PR.

## Bonnes pratiques de code
- Préférez les modules TypeScript dans `src/content` et `packages/*`.
- Factorisez les helpers dans `src/common` ou `packages/core`.
- Utilisez `chrome.storage.local` via les wrappers disponibles dans `src/common/storage.js`.
- Évitez les `any` : si besoin, ajoutez les types dans `types/*.d.ts`.
- Documentez les fonctions complexes avec des commentaires concis.

## Support
- Questions techniques : Discussions GitHub ou issues avec le tag `question`.
- Bugs critiques : ouvrez une issue et mentionnez la version de Firefox + OS.
- Idées de fonctionnalités : proposez une discussion pour valider l’approche avant implémentation.

> Merci de participer à rendre le Web plus accessible ✨
