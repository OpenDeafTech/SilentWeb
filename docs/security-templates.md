# Modèles de revue sécurité

Ces exemples servent de référence rapide pendant les revues afin de comparer les changements proposés à une configuration 1.1.1 considérée comme sûre.

## Exemple de diff `manifest.json`

```diff
diff --git a/public/manifest.json b/public/manifest.json
@@
-  "permissions": [
-    "tabs",
-    "storage",
-    "activeTab",
-    "notifications"
-  ],
+  "permissions": [
+    "storage"
+  ],
   "host_permissions": [
     "https://example.com/*"
   ]
```

Objectif : privilégier `storage` + hôtes ciblés, laisser `activeTab` uniquement si indispensable et documenté.

## Modèle CSP pour le manifest

Ajoutez ou validez cette section dans `manifest.json` (Manifest V3) :

```json
{
  "content_security_policy": {
    "extension_pages": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  }
}
```

Pour les scripts injectés côté page, appliquez la même politique via les en-têtes HTTP si vous servez vos propres pages (ex. tests, démos). Aucune ressource distante (`https://cdn.example.com`) ne doit être ajoutée sans justification.

## Points à vérifier
- Les permissions supprimées restent supprimées après rebase.
- Les nouvelles permissions ou origines sont listées dans la PR.
- Le CSP ne contient pas de `unsafe-eval` ou `data:` non nécessaires.

Utilisez ce document dans vos revues pour comparer rapidement les changements aux réglages de référence.
