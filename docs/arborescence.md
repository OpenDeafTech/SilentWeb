---
layout: default
title: Arborescence du repo
---

{% include nav.md %}

# Arborescence du repo

```
SilentWeb/
├── package.json              # scripts build, lint, test, dev, web-ext ajoutés
├── tsconfig.json             # racine composite
├── tsconfig.base.json        # options partagées
├── web-ext.config.cjs        # config Firefox (sourceDir, artefactsDir, run)
├── eslint.config.js          # flat config eslint + plugins import/unused
├── .prettierrc               # règles Prettier
├── .prettierignore
├── .gitignore
├── .editorconfig
├── docs/
│   └── README.md
├── tests/
│   ├── setup.ts              # stub global chrome pour Vitest
│   ├── utils/
│   │   └── dom.ts            # helper mount()
│   └── unit/
│       ├── chrome.mock.js    # mock API Chrome
│       └── inspect.spec.js   # tests utils inspect/highlight
├── src/
│   ├── content/
│   │   ├── inject.js
│   │   ├── overlay.js
│   │   ├── overlay.css
│   │   └── index.ts
│   ├── worker/
│   │   └── service.js
│   ├── messaging/
│   │   └── bus.ts            # bus de messages (runtime, fallback local)
│   ├── platform/
│   │   └── browser.ts        # polyfill chrome/browser API
│   ├── utils/
│   │   ├── dom.js
│   │   ├── inspect.js
│   │   ├── logging/
│   │   │   └── logger.ts
│   │   └── storage/
│   │       └── index.ts
│   ├── config/
│   │   └── index.ts
│   ├── i18n/
│   │   └── index.ts
│   ├── analytics/
│   │   └── telemetry.ts
│   ├── perf/
│   │   └── marks.ts
│   ├── ui/
│   │   └── ErrorBoundary.tsx
│   └── index.ts
├── dist/                     # généré après build
│   ├── content/
│   ├── worker/
│   └── vendor/
└── web-ext-artifacts/        # généré par web-ext build
```
