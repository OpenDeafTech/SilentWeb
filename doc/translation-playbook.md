# Translation Playbook — SilentWeb

## Objectif

Garantir une localisation cohérente, inclusive et testée de SilentWeb en combinant mémoire de traduction, LLM et QA automatisée. Le fichier `locales-language-labels.csv` reste l’unique source de vérité ; les JSON sous `_locales/` sont régénérés via `pnpm run locales:update`.

## Pipeline assisté

1. **Extraction** – `pnpm run locales:pipeline` exporte le CSV canonique, détecte les chaînes à traduire et génère `translations/pipeline/<locale>.pending.csv`.
2. **Pré‑traduction** – Alimenter Termerion, DeepL Glossaries ou tout TMS connecté (via `pnpm run locales:sync`) avec les CSV générés. Utiliser le prompt versionné dans `translations/prompts/llm-base.md` pour GPT‑4o / Claude Sonnet.
3. **Revue humaine** – Chaque langue possède un reviewer défini dans `locales-metadata.json`. Toute traduction générée automatiquement doit être validée par cette personne, qui applique les règles de style ci-dessous.
4. **Réinjection** – Mettre à jour `locales-language-labels.csv` (ou les CSV pending), puis exécuter `pnpm run locales:update` pour refléter les changements dans `_locales/**`.
5. **QA linguistique** – `pnpm run locales:lint` + `pnpm exec vitest run tests/unit/locales.snap.spec.ts` + `pnpm run test:e2e --grep "@i18n"` pour vérifier les placeholders, snapshots et rendu réel (Playwright i18n).
6. **Publication** – `pnpm run locales:report` génère `docs/locales-status.md` (diffusé sur GitHub Pages) afin que les traducteurs visualisent les priorités et anomalies en cours.

## Règles linguistiques (extrait)

| Langue | Ton & registre | Particularités terminologiques |
| --- | --- | --- |
| **Français (fr)** | Tutoiement empathique, phrases courtes, écriture inclusive avec points médians quand cela n’alourdit pas la lecture (`utilisateur·rice`). | Ne traduire “SilentWeb” ni “Firefox”. Préférer “sous-titres” plutôt que “captions”. |
| **Anglais (en)** | Source de vérité. Style direct, guides d’accessibilité W3C. | Garder l’US English. |
| **Espagnol (es)** | Tutoiement neutre. Maintenir des tournures neutres en genre (“personas usuarias”). | “Subtítulos”, “alertas visuales”. |
| **Allemand (de)** | Siezen modéré, phrases explicatives. | “Untertitel”, “Barrierefreiheit”. |
| **Portugais (pt-BR)** | Você, ton chaleureux. | “Legendas”, “alertas visuais”. |
| **Italien (it)** | Tu/vous selon contexte, rester cohérent. | “Sottotitoli”, “accessibilità”. |

Pour les autres langues : suivre les recommandations du reviewer déclaré dans `locales-metadata.json`. Ajouter toute variation au tableau ci-dessus via PR.

## Terminologie & inclusivité

- Ne jamais traduire les noms propres, raccourcis clavier ou noms de menus.
- Éviter les expressions capacitistes (“normal”, “valide”). Préférer “personnes entendantes”.
- Préserver tous les placeholders (`$1`, `%s`, `{USERNAME}`) et les balises HTML.
- Limiter les phrases à 90 caractères quand l’UI le permet afin d’éviter les débordements.

## QA automatisée

1. `pnpm run locales:lint` – détecte les traductions manquantes, placeholders incohérents, dérives ICU (genre/pluriel) et variations de longueur excessives.
2. `pnpm exec vitest run tests/unit/locales.snap.spec.ts` – met à jour les snapshots pour s’assurer que le catalogue reste stable.
3. `pnpm run test:e2e --grep "@i18n"` – scénarios Playwright qui basculent la locale dans les fixtures (`tests/e2e/fixtures/*.html`) pour vérifier l’affichage réel.
4. `pnpm run locales:report` – publie la couverture et les anomalies afin que les reviewers priorisent les manques.

## Connecteur TMS (lecture seule)

- Configurer `locales-tms.config.json` avec le provider de votre choix (Lokalise, Crowdin, Smartling…).
- Lancer `pnpm run locales:sync [--provider=crowdin]` pour rapatrier les traductions et normaliser les libellés via `locales:update`. Le dépôt reste la source.
- Les tokens/API keys ne doivent jamais être commités ; utilisez des variables d’environnement (`LOKALISE_TOKEN`, `CROWDIN_PERSONAL_TOKEN`, etc.).

## Escalade & reviews

1. Reporter toute ambiguïté dans `docs/locales-status.md` (section anomalies) et ouvrir un ticket GitHub étiqueté `i18n`.
2. Mentionner le reviewer assigné (cf. `locales-metadata.json`) dans la PR. En cas d’absence, ping `#translations` sur Matrix/Slack.
3. Les builds localisés doivent être testés avec `pnpm run build` puis `pnpm run test:e2e` avant diffusion.

Ce playbook doit être maintenu à jour à chaque évolution des règles linguistiques ou du pipeline.
