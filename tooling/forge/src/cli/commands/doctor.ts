import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import fg from "fast-glob";
import { logger, PROJECT_ROOT } from "../utils";

export type DoctorSectionName = "env" | "db" | "deps";

interface DoctorCheck {
  name: string;
  ok: boolean;
  detail?: string;
  fixHint?: string;
}

interface DoctorSection {
  name: DoctorSectionName;
  ok: boolean;
  checks: DoctorCheck[];
}

interface DoctorSummary {
  totalSections: number;
  failedSections: number;
  totalChecks: number;
  failedChecks: number;
}

interface DoctorOptions {
  json?: boolean;
  section?: DoctorSectionName;
}

interface PackageManifest {
  path: string;
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

async function checkFile(path: string): Promise<boolean> {
  try {
    await access(path);
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

function summarizeSection(section: DoctorSection): string {
  const failed = section.checks.filter((check) => !check.ok).length;
  return `${section.name}: ${section.checks.length - failed}/${section.checks.length} passed`;
}

function buildSummary(sections: DoctorSection[]): DoctorSummary {
  const totalChecks = sections.reduce((sum, section) => sum + section.checks.length, 0);
  const failedChecks = sections.reduce(
    (sum, section) => sum + section.checks.filter((check) => !check.ok).length,
    0,
  );
  const failedSections = sections.filter((section) => !section.ok).length;

  return {
    totalSections: sections.length,
    failedSections,
    totalChecks,
    failedChecks,
  };
}

async function readWorkspacePackageManifests(): Promise<PackageManifest[]> {
  const manifestPaths = await fg(
    ["apps/*/package.json", "packages/*/package.json", "tooling/*/package.json"],
    {
      cwd: PROJECT_ROOT,
      absolute: true,
      onlyFiles: true,
    },
  );

  return Promise.all(
    manifestPaths.map(async (path) => {
      const content = await readFile(path, "utf-8");
      return { path, ...(JSON.parse(content) as Omit<PackageManifest, "path">) };
    }),
  );
}

async function runEnvDoctor(): Promise<DoctorSection> {
  const nodeVersion = process.version;
  const pnpmVersion = await getBinaryVersion("pnpm");
  const turboVersion = await getBinaryVersion("turbo");

  const checks: DoctorCheck[] = [
    {
      name: "node",
      ok: isMajorAtLeast(nodeVersion, 22),
      detail: `${nodeVersion} (required >=22)`,
      fixHint: "Install Node.js 22 or newer.",
    },
    {
      name: "pnpm",
      ok: pnpmVersion !== null && isMajorAtLeast(pnpmVersion, 10),
      detail: pnpmVersion ? `${pnpmVersion} (required >=10)` : "binary missing",
      fixHint: "Install pnpm 10 or newer.",
    },
    {
      name: "turbo",
      ok: turboVersion !== null,
      detail: turboVersion ?? "binary missing",
      fixHint: "Run pnpm install so the local turbo binary is available.",
    },
    {
      name: "pnpm-workspace.yaml",
      ok: await checkFile(join(PROJECT_ROOT, "pnpm-workspace.yaml")),
      detail: "workspace manifest",
      fixHint: "Restore pnpm-workspace.yaml at the repo root.",
    },
    {
      name: "turbo.json",
      ok: await checkFile(join(PROJECT_ROOT, "turbo.json")),
      detail: "turbo pipeline config",
      fixHint: "Restore turbo.json at the repo root.",
    },
    {
      name: ".env",
      ok: await checkFile(join(PROJECT_ROOT, ".env")),
      detail: "project environment file",
      fixHint: "Create .env from your local template or sync it from the team secrets source.",
    },
  ];

  return {
    name: "env",
    ok: checks.every((check) => check.ok),
    checks,
  };
}

async function runDbDoctor(): Promise<DoctorSection> {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const checks: DoctorCheck[] = [
    {
      name: "package",
      ok: await checkFile(join(PROJECT_ROOT, "packages/database/package.json")),
      detail: "database workspace package",
      fixHint: "Restore packages/database/package.json so forge can locate the database workspace.",
    },
    {
      name: "drizzle-config",
      ok: await checkFile(join(PROJECT_ROOT, "packages/database/config/drizzle.config.ts")),
      detail: "Drizzle config",
      fixHint: "Restore packages/database/config/drizzle.config.ts for Drizzle operations.",
    },
    {
      name: "seed-script",
      ok: await checkFile(join(PROJECT_ROOT, "packages/database/seed/seed.ts")),
      detail: "database seed entrypoint",
      fixHint: "Restore packages/database/seed/seed.ts so forge db seed can run.",
    },
    {
      name: "database-url",
      ok: Boolean(databaseUrl),
      detail: databaseUrl
        ? "DATABASE_URL or DIRECT_URL is set"
        : "DATABASE_URL and DIRECT_URL are missing",
      fixHint: "Set DATABASE_URL or DIRECT_URL in .env before running database commands.",
    },
  ];

  return {
    name: "db",
    ok: checks.every((check) => check.ok),
    checks,
  };
}

function collectWorkspaceRefs(manifest: PackageManifest): string[] {
  const sources = [
    manifest.dependencies,
    manifest.devDependencies,
    manifest.peerDependencies,
    manifest.optionalDependencies,
  ];

  return sources.flatMap((deps) =>
    Object.entries(deps ?? {})
      .filter(([, version]) => version.startsWith("workspace:"))
      .map(([name]) => name),
  );
}

async function runDepsDoctor(): Promise<DoctorSection> {
  const manifests = await readWorkspacePackageManifests();
  const namedManifests = manifests.filter((manifest) => typeof manifest.name === "string");
  const packageNames = namedManifests.map((manifest) => manifest.name as string);
  const uniqueNames = new Set(packageNames);
  const duplicateNames = packageNames.filter((name, index) => packageNames.indexOf(name) !== index);
  const missingNames = manifests.filter((manifest) => !manifest.name);
  const missingWorkspaceRefs = manifests.flatMap((manifest) =>
    collectWorkspaceRefs(manifest)
      .filter((dependency) => !uniqueNames.has(dependency))
      .map((dependency) => `${manifest.path} -> ${dependency}`),
  );

  const checks: DoctorCheck[] = [
    {
      name: "pnpm-lock.yaml",
      ok: await checkFile(join(PROJECT_ROOT, "pnpm-lock.yaml")),
      detail: "workspace lockfile",
      fixHint: "Run pnpm install to regenerate pnpm-lock.yaml.",
    },
    {
      name: "package-names",
      ok: missingNames.length === 0,
      detail:
        missingNames.length === 0
          ? `${manifests.length} package manifests have names`
          : `${missingNames.length} package.json files are missing a name field`,
      fixHint: "Add a unique name field to each workspace package.json file.",
    },
    {
      name: "duplicate-package-names",
      ok: duplicateNames.length === 0,
      detail:
        duplicateNames.length === 0
          ? `${uniqueNames.size} unique workspace package names`
          : `duplicates: ${[...new Set(duplicateNames)].join(", ")}`,
      fixHint: "Rename duplicate workspace packages so every package name is unique.",
    },
    {
      name: "workspace-dependencies",
      ok: missingWorkspaceRefs.length === 0,
      detail:
        missingWorkspaceRefs.length === 0
          ? "all workspace:* references resolve"
          : `${missingWorkspaceRefs.length} unresolved workspace dependency references (${missingWorkspaceRefs[0]})`,
      fixHint: "Update the workspace:* dependency name or restore the referenced package.",
    },
  ];

  return {
    name: "deps",
    ok: checks.every((check) => check.ok),
    checks,
  };
}

function printTextReport(sections: DoctorSection[], summary: DoctorSummary): void {
  const passedChecks = summary.totalChecks - summary.failedChecks;
  logger.log(
    `[doctor] ${summary.totalSections} sections, ${passedChecks}/${summary.totalChecks} checks passed, ${summary.failedSections} sections failed`,
  );
  logger.log("");
  for (const section of sections) {
    logger.log(`[doctor:${section.name}] ${summarizeSection(section)}`);
    for (const check of section.checks) {
      const line = check.detail ? `${check.name}: ${check.detail}` : check.name;
      if (check.ok) {
        logger.success(line);
      } else {
        logger.error(line);
        if (check.fixHint) {
          logger.info(`  fix: ${check.fixHint}`);
        }
      }
    }
    logger.log("");
  }
}

export async function runDoctor(options: DoctorOptions = {}): Promise<void> {
  const sectionNames: DoctorSectionName[] = options.section
    ? [options.section]
    : ["env", "db", "deps"];

  const sectionRunners: Record<DoctorSectionName, () => Promise<DoctorSection>> = {
    env: runEnvDoctor,
    db: runDbDoctor,
    deps: runDepsDoctor,
  };

  const sections = await Promise.all(sectionNames.map((name) => sectionRunners[name]()));
  const ok = sections.every((section) => section.ok);
  const summary = buildSummary(sections);

  if (options.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok,
          summary,
          sections,
        },
        null,
        2,
      )}\n`,
    );
  } else {
    printTextReport(sections, summary);
  }

  if (!ok) {
    process.exitCode = 1;
  }
}
