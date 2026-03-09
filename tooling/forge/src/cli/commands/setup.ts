import { type RunOptions, runCommand } from "../runner";
import { logger, PROJECT_ROOT } from "../utils";
import { runDbOperation } from "./db";

export async function runSetup(options: RunOptions = {}): Promise<void> {
  logger.info("Running project setup...");
  await runDbOperation("migrate", options);
  await runCommand({ command: "lefthook", args: ["install"], cwd: PROJECT_ROOT }, options);
  logger.success("✓ project setup completed");
}
