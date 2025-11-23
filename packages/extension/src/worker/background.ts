import { initWorker } from "./service";
import { logError } from "../utils/logger";

try {
  initWorker();
} catch (error) {
  logError("SilentWeb worker init failed", error);
}
