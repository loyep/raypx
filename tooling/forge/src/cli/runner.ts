import { spawn } from "node:child_process";
import { logger, PROJECT_ROOT } from "./utils";

export interface CommandSpec {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

export interface RunOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export async function runCommand(spec: CommandSpec, options: RunOptions = {}): Promise<void> {
  const { command, args = [], cwd = PROJECT_ROOT, env } = spec;

  if (options.verbose || options.dryRun) {
    logger.info(`$ ${command} ${args.join(" ")}`);
  }

  if (options.dryRun) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code ?? 1}`));
      }
    });

    child.on("error", reject);
  });
}
