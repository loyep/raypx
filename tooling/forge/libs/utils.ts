import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenvx from "@dotenvx/dotenvx";
import { logger } from "./logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findWorkspaceRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error("Workspace root not found from forge CLI location");
    }
    current = parent;
  }
}

/** Project root directory (monorepo root) */
export const PROJECT_ROOT = findWorkspaceRoot(__dirname);

// Load environment variables from project root .env file
dotenvx.config({ path: join(PROJECT_ROOT, ".env"), quiet: true });

/**
 * Formats duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Options for command execution
 */
export interface ExecOptions {
  /** Working directory (defaults to PROJECT_ROOT) */
  cwd?: string;
  /** Execution timeout in milliseconds (defaults to 180000ms) */
  timeout?: number;
  /** Additional environment variables */
  env?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 180_000;

/**
 * Execute command using Node spawn
 */
export async function execCommand(
  command: string,
  args: string[] = [],
  options: ExecOptions = {},
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const { cwd = PROJECT_ROOT, timeout = DEFAULT_TIMEOUT, env = {} } = options;

  logger.debug(`Executing: ${command} ${args.join(" ")}`);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: true,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      clearTimeout(timeoutId);
      resolve({
        exitCode: code ?? 1,
        stdout: "",
        stderr: "",
      });
    });

    child.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}
