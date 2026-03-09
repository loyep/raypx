import { cac } from "cac";
import { runDbOperation } from "./commands/db";
import type { DoctorSectionName } from "./commands/doctor";
import { runDoctor } from "./commands/doctor";
import { runSetup } from "./commands/setup";
import { runUiGenerate } from "./commands/ui";
import { runCommand } from "./runner";
import { logger } from "./utils";

interface CommonFlags {
  dryRun?: boolean;
  verbose?: boolean;
  json?: boolean;
}

const cli = cac("forge");
const doctorSections: DoctorSectionName[] = ["env", "db", "deps"];

function handleError(error: unknown): never {
  logger.error(error);
  process.exit(1);
}

function withErrorHandling(task: () => Promise<void>): Promise<void> {
  return task().catch(handleError);
}

cli.help();

cli
  .command("db <operation> [...extra]", "Run database operation")
  .usage("db <operation> [--dry-run] [--verbose]")
  .example("db generate  \t\t# generate migrations")
  .example("db push  \t\t# apply schema changes without generating files")
  .example("db migrate  \t\t# run existing migrations")
  .example("db studio  \t\t# open Drizzle Studio")
  .example("db pull  \t\t# introspect schema from the database")
  .example("db seed --dry-run  \t\t# preview seed execution")
  .option("--dry-run", "Print the command without executing it")
  .option("--verbose", "Print the underlying command before execution")
  .action((operation: string, extra: string[], flags: CommonFlags) =>
    withErrorHandling(async () => {
      if (extra.length > 0) {
        throw new Error(`Unexpected arguments for db command: ${extra.join(" ")}`);
      }
      await runDbOperation(operation, {
        dryRun: Boolean(flags.dryRun),
        verbose: Boolean(flags.verbose),
      });
    }),
  );

cli
  .command("ui generate", "Generate UI exports")
  .usage("ui generate")
  .example("ui generate  \t\t# generate UI exports")
  .action(() => withErrorHandling(runUiGenerate));

cli
  .command(
    "doctor [section]",
    "Run health checks. env checks runtime and env files; db checks database config; deps checks workspace dependencies.",
  )
  .usage("doctor [env|db|deps] [--json]")
  .example("doctor")
  .example("doctor  \t\t# runs env, db, and deps")
  .example("doctor env  \t\t# runtime binaries, workspace files, and .env")
  .example("doctor db  \t\t# database package files, config, and env vars")
  .example("doctor deps --json  \t# lockfile, package names, and workspace:* refs")
  .option("--json", "Print structured JSON output")
  .action((section: string | undefined, flags: CommonFlags) =>
    withErrorHandling(async () => {
      if (section && !doctorSections.includes(section as DoctorSectionName)) {
        throw new Error(`Invalid doctor section: ${section}. Valid: ${doctorSections.join(", ")}`);
      }
      await runDoctor({
        json: Boolean(flags.json),
        section: section as DoctorSectionName | undefined,
      });
    }),
  );

cli
  .command("setup", "Run initial project setup")
  .usage("setup [--dry-run] [--verbose]")
  .example("setup")
  .example("setup --dry-run  \t\t# print the commands without executing them")
  .option("--dry-run", "Print the commands without executing them")
  .option("--verbose", "Print the underlying commands before execution")
  .action((flags: CommonFlags) =>
    withErrorHandling(async () => {
      await runSetup({
        dryRun: Boolean(flags.dryRun),
        verbose: Boolean(flags.verbose),
      });
    }),
  );

cli
  .command("run [...command]", "Run an arbitrary command in the current working directory")
  .usage("run <command> [...args]")
  .example("run vite dev  \t\t# run the vite dev command")
  .example("run node -- --version")
  .allowUnknownOptions()
  .action(() => {
    const rawArgv = process.argv.slice(2);
    const runArgs = rawArgv.slice(1);
    const [command, ...commandArgs] = runArgs;
    withErrorHandling(async () => {
      if (!command) {
        throw new Error("Usage: forge run <command> [...args]");
      }
      await runCommand({ command, args: commandArgs, cwd: process.cwd() });
    });
  });

if (process.argv.slice(2).length === 0) {
  cli.outputHelp();
} else {
  try {
    cli.parse();
  } catch (error) {
    handleError(error);
  }
}
