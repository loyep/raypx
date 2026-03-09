import fg from "fast-glob";
import fs from "fs-extra";
import { type RunOptions, runCommand } from "../libs/runner";
import { logger, PROJECT_ROOT } from "../libs/utils";

/**
 * Keep only workspace-level caches here. Package build outputs stay in each package clean script.
 */
const CLEAN_PATTERNS = ["**/node_modules/.vite", ".turbo"];

/**
 * Clean workspace caches
 */
export async function runClean(options: RunOptions = {}): Promise<void> {
  logger.info("Cleaning workspace caches...");

  await runCommand(
    {
      command: "pnpm",
      args: ["-r", "--parallel", "--if-present", "run", "clean"],
      cwd: PROJECT_ROOT,
    },
    options,
  );

  const paths = (
    await fg(CLEAN_PATTERNS, {
      cwd: PROJECT_ROOT,
      absolute: true,
      onlyFiles: false,
      markDirectories: true,
      unique: true,
    })
  ).sort();

  for (const path of paths) {
    if (options.verbose || options.dryRun) {
      logger.info(`remove ${path}`);
    }

    if (!options.dryRun) {
      await fs.remove(path);
    }
  }

  logger.success("Workspace caches cleaned");
}
