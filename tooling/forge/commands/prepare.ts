import { type RunOptions, runCommand } from "../libs/runner";
import { logger, PROJECT_ROOT } from "../libs/utils";

interface PrepareOptions extends RunOptions {
  silent?: boolean;
}

/**
 * Run local workspace preparation tasks.
 */
export async function runPrepare(options: PrepareOptions = {}): Promise<void> {
  if (!options.silent) {
    logger.info("Running project prepare...");
  }
  await runCommand({ command: "lefthook", args: ["install"], cwd: PROJECT_ROOT }, options);
  if (!options.silent) {
    logger.success("Project prepare completed");
  }
}
