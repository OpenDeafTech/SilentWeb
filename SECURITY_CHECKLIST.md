# Security & Release Signing Checklist

Checklist pour la revue sécurité et la publication des artefacts signés.

Avant de publier une release ou d’attacher des artefacts signés :

- [ ] Les secrets de signature (ex. `AMO_API_KEY`, `AMO_API_SECRET`, clés Chrome Web Store) sont définis dans les `Secrets` du dépôt ou de l'organisation et ne sont pas présents dans le code.
- [ ] Les workflows qui utilisent des secrets exécutent `web-ext sign` ou commandes équivalentes dans des workflows séparés et audités (ex. `.github/workflows/release.yml`).
- [ ] Les permissions des workflows sont minimales (par ex. `contents: write` uniquement quand nécessaire). Vérifier la section `permissions:` des workflows.
- [ ] Les logs des workflows n’exposent pas de secrets en clair (utiliser `--api-key`/`--api-secret` via variables d’environnement et activer `masking` si nécessaire).
- [ ] Valider le processus de signature : artefacts non signés → job de signature → artefacts signés. Vérifier que les artefacts signés proviennent bien du job de signature approuvé.
- [ ] Effectuer une revue manuelle finale (au moins un reviewer) avant publication sur AMO/Chrome Web Store.
- [ ] Documenter dans l’issue de release les identifiants des builds signés et le résumé de la vérification (hashes, date, job run id).

Conseils pratiques

- Utiliser des workflows distincts pour la build (CI) et pour la signature/publish (release).
- Restreindre qui peut déclencher les workflows de publication (branch protection, approbations).
- Conserver un changelog et attacher les artefacts signés à la Release GitHub (pour auditabilité).

Voir aussi: https://extensionworkshop.com/documentation/publish/ (AMO) et la documentation Chrome Web Store pour les bonnes pratiques de signature et publication.
