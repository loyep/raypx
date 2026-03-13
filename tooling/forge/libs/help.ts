import type { CommandDef } from "citty";
import { type ForgeCommandDef, type ForgeMeta, forgeCommand } from "../forge";

/**
 * Resolve a value that can be T, Promise<T>, or a function returning either
 * Compatible with both Awaitable<T> and Resolvable<T> types from citty
 */
export async function resolveValue<T>(
  value: T | Promise<T> | (() => T) | (() => Promise<T>),
): Promise<T> {
  if (typeof value === "function") {
    return (await (value as () => T | Promise<T>)()) as T;
  }
  return (await value) as T;
}

/**
 * Resolve command for usage display by traversing subcommands based on raw args
 */
export async function resolveCommandForUsage(
  cmd: CommandDef,
  rawArgs: string[],
  parents: CommandDef[] = [],
): Promise<[CommandDef, CommandDef[]]> {
  const subCommands = cmd.subCommands ? await resolveValue(cmd.subCommands) : undefined;
  if (!subCommands || Object.keys(subCommands).length === 0) {
    return [cmd, parents];
  }

  const subCommandArgIndex = rawArgs.findIndex((arg) => !arg.startsWith("-"));
  const subCommandName = rawArgs[subCommandArgIndex];
  if (!subCommandName) {
    return [cmd, parents];
  }

  const nextCommand = await resolveValue(subCommands[subCommandName]);
  if (!nextCommand) {
    return [cmd, parents];
  }

  return resolveCommandForUsage(nextCommand, rawArgs.slice(subCommandArgIndex + 1), [
    ...parents,
    cmd,
  ]);
}

async function getMeta(cmd?: ForgeCommandDef | CommandDef): Promise<Partial<ForgeMeta>> {
  if (!cmd?.meta) return {};
  const meta = await resolveValue(
    cmd.meta as ForgeMeta | Promise<ForgeMeta> | (() => ForgeMeta) | (() => Promise<ForgeMeta>),
  );
  return meta as Partial<ForgeMeta>;
}

async function getArgs(cmd?: ForgeCommandDef) {
  return cmd?.args ? await resolveValue(cmd.args) : {};
}

async function getSubCommands(cmd?: ForgeCommandDef) {
  return cmd?.subCommands ? await resolveValue(cmd.subCommands) : {};
}

function formatRows(rows: Array<[string, string]>): string[] {
  if (rows.length === 0) {
    return [];
  }

  const width = Math.max(...rows.map(([left]) => left.length));
  return rows.map(([left, right]) => `  ${left.padEnd(width)}  ${right}`);
}

async function buildCommandPath(cmd: ForgeCommandDef, parents: CommandDef[]): Promise<string> {
  const all = [...parents, cmd];
  const names = await Promise.all(all.map(async (entry) => (await getMeta(entry)).name ?? ""));
  return names.filter(Boolean).join(" ").trim();
}

async function renderUsageSection(
  cmd: ForgeCommandDef,
  parents: CommandDef[],
  optionArgs: Array<[string, Awaited<ReturnType<typeof getArgs>>[string]]>,
  positionalArgs: Array<[string, Awaited<ReturnType<typeof getArgs>>[string]]>,
  subCommands: Awaited<ReturnType<typeof getSubCommands>>,
): Promise<string[]> {
  const lines = ["Usage:"];

  if (cmd.usage) {
    lines.push(`  $ ${cmd.usage}`);
    return lines;
  }

  const usageParts = [`  $ ${await buildCommandPath(cmd, parents)}`];
  if (Object.keys(subCommands).length > 0) {
    usageParts.push("<command>");
  }
  if (optionArgs.length > 0) {
    usageParts.push("[options]");
  }
  for (const [name, def] of positionalArgs) {
    usageParts.push(def.required === false ? `[${name}]` : `<${name}>`);
  }
  lines.push(usageParts.join(" "));
  return lines;
}

async function renderCommandsSection(
  subCommands: Awaited<ReturnType<typeof getSubCommands>>,
): Promise<string[]> {
  if (Object.keys(subCommands).length === 0) {
    return [];
  }

  return [
    "Commands:",
    ...formatRows(
      await Promise.all(
        Object.entries(subCommands).map(async ([name, subCommand]) => {
          const subMeta = await getMeta(await resolveValue(subCommand));
          return [name, subMeta.description ?? ""] as [string, string];
        }),
      ),
    ),
  ];
}

function renderOptionsSection(
  optionArgs: Array<[string, Awaited<ReturnType<typeof getArgs>>[string]]>,
  positionalArgs: Array<[string, Awaited<ReturnType<typeof getArgs>>[string]]>,
): string[] {
  const lines = ["Options:"];

  if (positionalArgs.length === 0 && optionArgs.length === 0) {
    lines.push("  -h, --help  Display this message");
    return lines;
  }

  const optionRows: Array<[string, string]> = [["-h, --help", "Display this message"]];
  for (const [name, def] of optionArgs) {
    const flags = [];
    // Only non-positional args have alias property
    if ("alias" in def) {
      for (const alias of Array.isArray(def.alias) ? def.alias : def.alias ? [def.alias] : []) {
        flags.push(`-${alias}`);
      }
    }
    flags.push(`--${name}`);
    optionRows.push([flags.join(", "), def.description ?? ""]);
  }
  for (const [name, def] of positionalArgs) {
    optionRows.push([def.required === false ? `[${name}]` : `<${name}>`, def.description ?? ""]);
  }
  lines.push(...formatRows(optionRows));
  return lines;
}

function renderExamplesSection(meta: Awaited<ReturnType<typeof getMeta>>): string[] {
  if (!Array.isArray(meta.examples) || meta.examples.length === 0) {
    return [];
  }

  return ["Examples:", ...meta.examples.map((example) => `  $ ${example}`)];
}

/**
 * Render formatted usage text for a forge command
 */
export async function renderForgeUsage(
  cmd: ForgeCommandDef,
  parents: CommandDef[] = [],
): Promise<string> {
  const meta = await getMeta(cmd);
  const args = await getArgs(cmd);
  const subCommands = await getSubCommands(cmd);

  if (cmd === forgeCommand) {
    return [
      "forge",
      "",
      "Usage:",
      "  $ forge <command> [options]",
      "",
      "Command Groups:",
      "",
      "Workspace Commands:",
      "  clean             Clean workspace caches",
      "  doctor            Run health checks",
      "  prepare           Run local workspace preparation tasks",
      "  setup             Run initial project setup",
      "  run [...command]  Run an arbitrary command in the current working directory",
      "",
      "Database Commands:",
      "  db <command>      Run database operations",
      "",
      "Options:",
      "  -h, --help        Display this message",
    ].join("\n");
  }

  const lines: string[] = [];

  if (meta.description) {
    lines.push(meta.description);
    lines.push("");
  }

  const positionalArgs = Object.entries(args)
    .filter(([, def]) => def.type === "positional")
    .map(([name, def]) => [name, def] as [string, typeof def]);
  const optionArgs = Object.entries(args)
    .filter(([, def]) => def.type !== "positional")
    .map(([name, def]) => [name, def] as [string, typeof def]);

  lines.push(...(await renderUsageSection(cmd, parents, optionArgs, positionalArgs, subCommands)));

  const commandsSection = await renderCommandsSection(subCommands);
  if (commandsSection.length > 0) {
    lines.push("");
    lines.push(...commandsSection);
  }

  lines.push("");
  lines.push(...renderOptionsSection(optionArgs, positionalArgs));

  const examplesSection = renderExamplesSection(meta);
  if (examplesSection.length > 0) {
    lines.push("");
    lines.push(...examplesSection);
  }

  return lines.join("\n");
}

/**
 * Display usage information for a command
 */
export async function showUsage(cmd: CommandDef, parents: CommandDef[] = []): Promise<void> {
  process.stdout.write(`${await renderForgeUsage(cmd as ForgeCommandDef, parents)}\n\n`);
}
