import { runDbOperation } from "./commands/db";
import { runDoctor } from "./commands/doctor";
import { runUiGenerate } from "./commands/ui";
import { runCommand } from "./runner";
import { logger } from "./utils";

interface ParsedFlags {
  parallel: boolean;
  dryRun: boolean;
  verbose: boolean;
  json: boolean;
}

function parseFlags(argv: string[]): { positional: string[]; flags: ParsedFlags } {
  const positional: string[] = [];
  const flags: ParsedFlags = { parallel: false, dryRun: false, verbose: false, json: false };

  for (const token of argv) {
    if (token === "--") {
      continue;
    }
    if (token === "--parallel") {
      flags.parallel = true;
      continue;
    }
    if (token === "--dry-run") {
      flags.dryRun = true;
      continue;
    }
    if (token === "--verbose") {
      flags.verbose = true;
      continue;
    }
    if (token === "--json") {
      flags.json = true;
      continue;
    }
    positional.push(token);
  }

  return { positional, flags };
}

function printHelp() {
  logger.log("forge - monorepo CLI");
  logger.log("");
  logger.log("Usage:");
  logger.log("  forge db <operation> [--parallel] [--dry-run] [--verbose]");
  logger.log("  forge ui generate");
  logger.log("  forge doctor [--json]");
  logger.log("  forge run <command> [...args]");
  logger.log("");
  logger.log("Database:");
  logger.log("  operation: generate | push | migrate | studio | pull | check-ai");
  logger.log("  default target: main");
}

function printDbHelp() {
  logger.log("Usage:");
  logger.log("  forge db <operation> [--parallel] [--dry-run] [--verbose]");
  logger.log("");
  logger.log("operation: generate | push | migrate | studio | pull | check-ai");
  logger.log("default target: main");
}

async function main(): Promise<void> {
  const rawArgv = process.argv.slice(2);
  if (rawArgv[0] === "run") {
    const runArgs = rawArgv.slice(1).filter((arg) => arg !== "--");
    const [command, ...commandArgs] = runArgs;
    if (!command) {
      throw new Error("Usage: forge run <command> [...args]");
    }
    await runCommand({ command, args: commandArgs, cwd: process.cwd() });
    return;
  }

  const argv = process.argv.slice(2);
  const { positional, flags } = parseFlags(argv);

  if (positional.length === 0 || positional[0] === "help" || positional[0] === "--help") {
    printHelp();
    return;
  }

  const [command, ...rest] = positional;

  if (command === "db") {
    const [operation, ...extra] = rest;
    if (!operation || operation === "help" || operation === "--help") {
      printDbHelp();
      return;
    }
    if (extra.length > 0) {
      throw new Error(`Unexpected arguments for db command: ${extra.join(" ")}`);
    }
    await runDbOperation(operation, flags);
    return;
  }

  if (command === "ui") {
    const [action] = rest;
    if (action !== "generate") {
      throw new Error("Usage: forge ui generate");
    }
    await runUiGenerate();
    return;
  }

  if (command === "doctor") {
    await runDoctor({ json: flags.json });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  logger.error(error);
  printHelp();
  process.exit(1);
});
