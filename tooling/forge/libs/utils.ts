import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenvx from "@dotenvx/dotenvx";
import { createLogger } from "@raypx/core/logger";
import fg from "fast-glob";
import fs from "fs-extra";

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

/** Cache directory for build artifacts */
export const CACHE_DIR = resolve(PROJECT_ROOT, "node_modules/.cache");

export const logger = createLogger({
  tag: "forge",
  compact: true,
  timestamp: false,
});

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

/**
 * Get cache file path (computed lazily to avoid module initialization issues)
 */
function getCacheFilePath(): string {
  return join(CACHE_DIR, "raypx-forge/component-exports.json");
}

/**
 * Cache structure: maps package name to hash of files list
 */
interface ExportsCache {
  [pkgName: string]: {
    hash: string;
    timestamp: number;
  };
}

/**
 * Load cache from disk
 */
async function loadCache(): Promise<ExportsCache> {
  try {
    const content = await fs.readFile(getCacheFilePath(), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Save cache to disk
 */
async function saveCache(cache: ExportsCache): Promise<void> {
  await fs.outputFile(getCacheFilePath(), JSON.stringify(cache, null, 2), "utf-8");
}

/**
 * Compute hash of file list (used for cache invalidation)
 */
function computeHash(files: string[]): string {
  const sorted = [...files].sort();
  return createHash("sha256").update(sorted.join("|")).digest("hex");
}

/**
 * Validates package name to prevent object injection attacks
 */
function isValidPackageName(pkgName: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  return /^[a-zA-Z0-9_-]+$/.test(pkgName);
}

/**
 * Generates component exports for a specific package directory
 */
export async function generateComponentExports(pkgName: string): Promise<void> {
  const componentsDir = join(PROJECT_ROOT, `packages/ui/src/${pkgName}`);
  const fileName = "index.tsx";
  const filePath = join(componentsDir, fileName);

  const fgConfig = {
    cwd: componentsDir,
    onlyFiles: true,
    ignore: [fileName],
  };
  const entries = (await fg("*.tsx", fgConfig)).sort();

  if (entries.length === 0) return;

  // Validate package name to prevent object injection
  if (!isValidPackageName(pkgName)) {
    throw new Error(`Invalid package name: ${pkgName}`);
  }

  // Check cache to avoid unnecessary regeneration
  const cache = await loadCache();
  const currentHash = computeHash(entries);
  // Use Object.hasOwn for safe property access
  const cached = Object.hasOwn(cache, pkgName) ? cache[pkgName] : undefined;

  // Skip generation if cache exists and file list hasn't changed
  const isCacheValid = cached?.hash === currentHash;
  if (isCacheValid) {
    return;
  }

  // Generate exports
  const exportsBlock = entries
    .map((entry) => entry.replace(/\.tsx$/, ""))
    .sort()
    .map((name) => `export * from "./${name}";`)
    .join("\n");

  const content = `${exportsBlock}\n`;
  await fs.outputFile(filePath, content, "utf-8");

  // Update cache (pkgName is already validated above)
  cache[pkgName] = {
    hash: currentHash,
    timestamp: Date.now(),
  };
  await saveCache(cache);
}

/**
 * Generates component exports for all UI packages
 */
export async function generateAllComponentExports(): Promise<void> {
  const packages = ["components", "business"];
  await Promise.all(packages.map(generateComponentExports));
}
