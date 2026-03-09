import { runCommand } from "citty";
import { forgeCommand } from "../forge";
import { resolveCommandForUsage, showUsage } from "./help";
import { formatDuration, logger } from "./utils";

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exit(1);
}

function shouldLogDuration(args: string[]): boolean {
  return args.length > 0 && !args.includes("--help") && !args.includes("-h");
}

function isHelpRequest(args: string[]): boolean {
  return args.includes("--help") || args.includes("-h");
}

/**
 * Main entry point for forge CLI
 */
export async function mainEntry(): Promise<void> {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0) {
    await showUsage(forgeCommand);
    return;
  }

  const start = Date.now();
  const logDuration = shouldLogDuration(rawArgs);

  try {
    if (isHelpRequest(rawArgs)) {
      await showUsage(...(await resolveCommandForUsage(forgeCommand, rawArgs)));
      return;
    }

    await runCommand(forgeCommand, { rawArgs });

    if (logDuration) {
      logger.info(`Completed in ${formatDuration(Date.now() - start)}`);
    }
  } catch (error) {
    if (logDuration) {
      logger.info(`Failed after ${formatDuration(Date.now() - start)}`);
    }

    await showUsage(...(await resolveCommandForUsage(forgeCommand, rawArgs)));
    handleError(error);
  }
}
