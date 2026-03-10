import type { CommandDef } from "citty";
import { defineCommand } from "citty";
import { runClean } from "./commands/clean";
import { runDbOperation } from "./commands/db";
import type { DoctorSectionName } from "./commands/doctor";
import { runDoctor } from "./commands/doctor";
import { runSetup } from "./commands/setup";
import { runUiGenerate } from "./commands/ui";
import { runCommand as runShellCommand } from "./libs/runner";

export interface ForgeMeta {
  name: string;
  description: string;
  version?: string;
  examples?: string[];
}

export interface ForgeCommandDef extends CommandDef {
  meta?: ForgeMeta | (() => ForgeMeta) | Promise<ForgeMeta> | (() => Promise<ForgeMeta>);
  usage?: string;
}

interface TaskCommandOptions {
  name: string;
  description: string;
  examples?: string[];
  args?: ForgeCommandDef["args"];
  usage?: string;
  run: NonNullable<ForgeCommandDef["run"]>;
}

function createForgeCommand(def: ForgeCommandDef): ForgeCommandDef {
  return defineCommand(def) as ForgeCommandDef;
}

function createTaskCommand(options: TaskCommandOptions): ForgeCommandDef {
  const { name, description, examples, args, usage, run } = options;
  return createForgeCommand({
    meta: {
      name,
      description,
      examples,
    },
    args,
    usage,
    run,
  });
}

const commonBooleanArgs = {
  "dry-run": {
    type: "boolean" as const,
    description: "Print the command or cleanup plan without executing it",
    alias: "d",
  },
  verbose: {
    type: "boolean" as const,
    description: "Print the underlying commands before execution",
    alias: "v",
  },
};

const cleanCommand = createTaskCommand({
  name: "clean",
  description: "Clean workspace caches",
  examples: ["forge clean", "forge clean --dry-run --verbose"],
  args: commonBooleanArgs,
  async run({ args }) {
    await runClean({
      dryRun: Boolean(args["dry-run"]),
      verbose: Boolean(args.verbose),
    });
  },
});

function createDbOperationCommand(operation: string) {
  return createTaskCommand({
    name: operation,
    description: `Run db ${operation}`,
    examples: [`forge db ${operation}`, `forge db ${operation} --dry-run --verbose`],
    args: commonBooleanArgs,
    async run({ args }) {
      await runDbOperation(operation, {
        dryRun: Boolean(args["dry-run"]),
        verbose: Boolean(args.verbose),
      });
    },
  });
}

const dbCommand = createForgeCommand({
  meta: {
    name: "db",
    description: "Run database operations",
    examples: [
      "forge db generate",
      "forge db migrate",
      "forge db push",
      "forge db studio",
      "forge db pull",
      "forge db seed --dry-run",
    ],
  },
  subCommands: {
    generate: createDbOperationCommand("generate"),
    push: createDbOperationCommand("push"),
    migrate: createDbOperationCommand("migrate"),
    studio: createDbOperationCommand("studio"),
    pull: createDbOperationCommand("pull"),
    seed: createDbOperationCommand("seed"),
  },
});

function createDoctorSectionCommand(section: DoctorSectionName) {
  return createTaskCommand({
    name: section,
    description: `Run doctor ${section} checks`,
    examples: [`forge doctor ${section}`, `forge doctor ${section} --json`],
    args: {
      json: {
        type: "boolean",
        description: "Print structured JSON output",
      },
    },
    async run({ args }) {
      await runDoctor({
        json: Boolean(args.json),
        section,
      });
    },
  });
}

const doctorCommand = createForgeCommand({
  meta: {
    name: "doctor",
    description:
      "Run health checks. env checks runtime and env files; db checks database config; deps checks workspace dependencies; repo checks command/docs drift; arch checks browser-facing web boundaries.",
    examples: [
      "forge doctor",
      "forge doctor env",
      "forge doctor deps --json",
      "forge doctor repo",
      "forge doctor arch",
    ],
  },
  usage: "forge doctor [command] [options]",
  args: {
    json: {
      type: "boolean",
      description: "Print structured JSON output",
    },
  },
  subCommands: {
    env: createDoctorSectionCommand("env"),
    db: createDoctorSectionCommand("db"),
    deps: createDoctorSectionCommand("deps"),
    repo: createDoctorSectionCommand("repo"),
    arch: createDoctorSectionCommand("arch"),
  },
  async run({ args }) {
    await runDoctor({
      json: Boolean(args.json),
    });
  },
});

const setupCommand = createTaskCommand({
  name: "setup",
  description: "Run initial project setup",
  examples: ["forge setup", "forge setup --dry-run --verbose"],
  args: commonBooleanArgs,
  async run({ args }) {
    await runSetup({
      dryRun: Boolean(args["dry-run"]),
      verbose: Boolean(args.verbose),
    });
  },
});

const runCliCommand = createTaskCommand({
  name: "run",
  description: "Run an arbitrary command in the current working directory",
  examples: ["forge run vite dev", "forge run node -- --version"],
  usage: "forge run <command> [...args]",
  async run({ rawArgs }) {
    const [command, ...commandArgs] = rawArgs;
    if (!command) {
      throw new Error("Usage: forge run <command> [...args]");
    }

    await runShellCommand({ command, args: commandArgs, cwd: process.cwd() });
  },
});

const uiCommand = createForgeCommand({
  meta: {
    name: "ui",
    description: "UI tooling commands",
  },
  subCommands: {
    generate: createForgeCommand({
      meta: {
        name: "generate",
        description: "Generate UI exports",
        examples: ["forge ui generate"],
      },
      async run() {
        await runUiGenerate();
      },
    }),
  },
});

export const forgeCommand = createForgeCommand({
  meta: {
    name: "forge",
    version: "0.0.0",
    description: "Raypx workspace CLI",
  },
  subCommands: {
    clean: cleanCommand,
    db: dbCommand,
    doctor: doctorCommand,
    setup: setupCommand,
    run: runCliCommand,
    ui: uiCommand,
  },
});
