import { logger } from "../libs/logger";
import type { RunOptions } from "../libs/runner";
import { runDbOperation } from "./db";
import { runPrepare } from "./prepare";

/**
 * Run initial project setup
 */
export async function runSetup(options: RunOptions = {}): Promise<void> {
  logger.info("Running project setup...");
  await runDbOperation("push", options);
  await runPrepare({ ...options, silent: true });
  logger.success("Project setup completed");
}
