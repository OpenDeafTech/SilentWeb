// packages/extension/src/index.ts
// SilentWeb — Extension Firefox/Chromium (point d’entrée principal)

import browser from "webextension-polyfill";
import { initOverlay } from "./content/overlay";
import { initWorker } from "./worker/service";
import { logInfo, logError } from "./utils/logger";

// Type de configuration globale
interface SilentWebConfig {
  version: string;
  debug: boolean;
  features: {
    transcription: boolean;
    subtitles: boolean;
    alerts: boolean;
  };
}

// Messages échangés entre scripts
interface SilentWebMessage {
  type: string;
  [key: string]: unknown;
}

// Détails de l’événement onInstalled (simplifié)
type OnInstalledDetails =
  | { reason: "install" | "browser_update" | "shared_module_update"; id?: string }
  | { reason: "update"; previousVersion?: string; id?: string };

// Infos de l’expéditeur de message
type MessageSender = { tab?: { id?: number }; frameId?: number; url?: string; id?: string };

// Configuration par défaut
const defaultConfig: SilentWebConfig = {
  version: "0.0.1",
  debug: true,
  features: {
    transcription: true,
    subtitles: true,
    alerts: true,
  },
};

// Initialise l’extension
function main(config: SilentWebConfig = defaultConfig): void {
  try {
    logInfo(`SilentWeb ${config.version} — Initialisation...`);

    if (config.debug) {
      logInfo("Mode debug activé");
    }

    if (config.features.subtitles || config.features.alerts) {
      initOverlay();
    }

    if (config.features.transcription) {
      initWorker();
    }

    logInfo("SilentWeb initialisé avec succès");
  } catch (err) {
    logError("Erreur critique lors de l'initialisation", err);
  }
}

// Événement d’installation
browser.runtime.onInstalled.addListener((details: OnInstalledDetails): void => {
  logInfo(
    `Extension installée ou mise à jour : ${
      "reason" in details ? details.reason : "inconnu"
    }`
  );
  main();
});

// Événement de démarrage
browser.runtime.onStartup.addListener((): void => {
  logInfo("Extension démarrée");
  main();
});

// Réception de messages (content, popup, etc.)
browser.runtime.onMessage.addListener(
  (msg: SilentWebMessage, sender: MessageSender): Promise<unknown> | void => {
    logInfo("Message reçu:", msg, "de", sender);
    if (msg.type === "ping") {
      return Promise.resolve({ type: "pong" });
    }
  }
);
