import { type RunOptions, runCommand } from "../libs/runner";
import { logger, PROJECT_ROOT } from "../libs/utils";
import { runDbOperation } from "./db";

/**
 * Run initial project setup
 */
export async function runSetup(options: RunOptions = {}): Promise<void> {
  logger.info("Running project setup...");
  await runDbOperation("migrate", options);
  await runCommand({ command: "lefthook", args: ["install"], cwd: PROJECT_ROOT }, options);
  logger.success("Project setup completed");
}
