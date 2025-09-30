import browser from "webextension-polyfill";
import { logInfo, logError } from "../utils/logger";

interface SilentWebMessage { type: string; [k: string]: unknown }
type MessageSender = { tab?: { id?: number }; frameId?: number; url?: string; id?: string };

export function initWorker(): void {
  logInfo("Service worker initialisé");

  browser.runtime.onMessage.addListener(
    async (msg: SilentWebMessage, sender: MessageSender): Promise<unknown> => {
      try {
        logInfo("Worker: message reçu", msg, "de", sender);
        switch (msg.type) {
          case "ping":
            return { type: "pong" };
          case "transcribe":
            return { ok: true, text: "(stub) transcription en cours" };
          default:
            return { ok: false, error: "unknown-message-type" };
        }
      } catch (e) {
        logError("Erreur dans worker.onMessage", e);
        return { ok: false, error: "internal-error" };
      }
    }
  );
}
