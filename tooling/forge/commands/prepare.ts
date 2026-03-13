import { logger } from "../libs/logger";
import { type RunOptions, runCommand } from "../libs/runner";
import { PROJECT_ROOT } from "../libs/utils";

interface PrepareOptions extends RunOptions {
  silent?: boolean;
}

function shouldSkipHookInstall(): string | null {
  if (process.env.LEFTHOOK === "0") {
    return "LEFTHOOK=0";
  }

  return null;
}

/**
 * Run local workspace preparation tasks.
 */
export async function runPrepare(options: PrepareOptions = {}): Promise<void> {
  if (!options.silent) {
    logger.info("Running project prepare...");
  }

  const skipReason = shouldSkipHookInstall();
  if (skipReason) {
    if (!options.silent) {
      logger.info(`Skipping lefthook install (${skipReason})`);
      logger.success("Project prepare completed");
    }
    return;
  }

  await runCommand({ command: "lefthook", args: ["install"], cwd: PROJECT_ROOT }, options);
  if (!options.silent) {
    logger.success("Project prepare completed");
  }
}
