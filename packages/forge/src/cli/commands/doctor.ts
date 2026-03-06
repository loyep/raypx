import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { logger, PROJECT_ROOT } from "../utils";

interface DoctorResult {
  name: string;
  ok: boolean;
  detail?: string;
}

interface DoctorOptions {
  json?: boolean;
}

async function checkBinary(name: string): Promise<boolean> {
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(name, ["--version"], { stdio: "ignore", shell: false });
      child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(String(code)))));
      child.on("error", reject);
    });
    return true;
  } catch {
    return false;
  }
}

async function getBinaryVersion(name: string): Promise<string | null> {
  try {
    const output = await new Promise<string>((resolve, reject) => {
      const child = spawn(name, ["--version"], {
        stdio: ["ignore", "pipe", "ignore"],
        shell: false,
      });
      let stdout = "";
      child.stdout.on("data", (chunk) => {
        stdout += String(chunk);
      });
      child.on("exit", (code) =>
        code === 0 ? resolve(stdout.trim()) : reject(new Error(String(code))),
      );
      child.on("error", reject);
    });
    return output || null;
  } catch {
    return null;
  }
}

function isMajorAtLeast(version: string, minimumMajor: number): boolean {
  const normalized = version.replace(/^v/i, "");
  const major = Number(normalized.split(".")[0]);
  return Number.isFinite(major) && major >= minimumMajor;
}

async function checkFile(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function runDoctor(options: DoctorOptions = {}): Promise<void> {
  const nodeVersion = process.version;
  const pnpmVersion = await getBinaryVersion("pnpm");
  const turboVersion = await getBinaryVersion("turbo");

  const checks = await Promise.all([
    checkBinary("node"),
    checkBinary("pnpm"),
    checkBinary("turbo"),
    checkFile(join(PROJECT_ROOT, "pnpm-workspace.yaml")),
    checkFile(join(PROJECT_ROOT, "turbo.json")),
    checkFile(join(PROJECT_ROOT, ".env")),
  ]);

  const results: DoctorResult[] = [
    {
      name: "node",
      ok: checks[0] && isMajorAtLeast(nodeVersion, 22),
      detail: checks[0] ? `${nodeVersion} (required >=22)` : "binary missing",
    },
    {
      name: "pnpm",
      ok: checks[1] && pnpmVersion !== null && isMajorAtLeast(pnpmVersion, 10),
      detail: checks[1] ? `${pnpmVersion ?? "unknown"} (required >=10)` : "binary missing",
    },
    {
      name: "turbo",
      ok: checks[2],
      detail: turboVersion ?? (checks[2] ? "installed" : "binary missing"),
    },
    { name: "pnpm-workspace.yaml", ok: checks[3] },
    { name: "turbo.json", ok: checks[4] },
    { name: ".env", ok: checks[5] },
  ];

  if (options.json) {
    process.stdout.write(`${JSON.stringify({ checks: results }, null, 2)}\n`);
  } else {
    for (const result of results) {
      const line = result.detail ? `${result.name}: ${result.detail}` : result.name;
      if (result.ok) {
        logger.success(`✓ ${line}`);
      } else {
        logger.error(`✗ ${line}`);
      }
    }
  }

  if (results.some((result) => !result.ok)) {
    process.exit(1);
  }
}
