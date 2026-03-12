import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import fg from "fast-glob";
import ts from "typescript";
import { logger } from "../libs/logger";
import { PROJECT_ROOT } from "../libs/utils";
import { repoPolicy } from "../repo-policy";

/**
 * Doctor check section names
 */
export type DoctorSectionName = "env" | "db" | "deps" | "repo" | "arch";

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
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

interface RootManifest {
  scripts?: Record<string, string>;
}

interface OperabilityPolicy {
  requiredScripts?: string[];
  allowMissingScripts?: Record<string, string[]>;
  buildable?: string[];
  sourceOnly?: string[];
}

async function checkFile(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf-8")) as T;
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

async function readRootManifest(): Promise<RootManifest> {
  return readJsonFile<RootManifest>(join(PROJECT_ROOT, "package.json"));
}

function readTurboBuildOutputs(content: string): string[] {
  try {
    const parsed = JSON.parse(content) as {
      tasks?: Record<string, { outputs?: string[] }>;
    };
    return parsed.tasks?.build?.outputs ?? [];
  } catch {
    return [];
  }
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

function extractPnpmRunReferences(content: string): string[] {
  return [...content.matchAll(/pnpm run ([a-zA-Z0-9:_-]+)/g)].flatMap((match) =>
    match[1] ? [match[1]] : [],
  );
}

function extractMarkdownLinks(content: string): string[] {
  return [...content.matchAll(/\]\(([^)]+)\)/g)]
    .flatMap((match) => (match[1] ? [match[1]] : []))
    .filter((target) => !target.startsWith("http") && !target.startsWith("#"))
    .map((target) => target.replace(/^\.\//, ""));
}

function getObjectProperty(
  object: ts.ObjectLiteralExpression,
  propertyName: string,
): ts.ObjectLiteralElementLike | undefined {
  return object.properties.find((property) => {
    if (
      !ts.isPropertyAssignment(property) &&
      !ts.isShorthandPropertyAssignment(property) &&
      !ts.isMethodDeclaration(property)
    ) {
      return false;
    }

    if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name)) {
      return false;
    }

    return property.name.text === propertyName;
  });
}

function readStringArrayFromExpression(expression: ts.Expression | undefined): string[] {
  if (!expression || !ts.isArrayLiteralExpression(expression)) {
    return [];
  }

  return expression.elements.flatMap((element) =>
    ts.isStringLiteral(element) || ts.isNoSubstitutionTemplateLiteral(element)
      ? [element.text]
      : [],
  );
}

function findVitestConfigObject(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression | null {
  for (const statement of sourceFile.statements) {
    if (!ts.isExportAssignment(statement)) continue;
    if (!ts.isCallExpression(statement.expression)) continue;
    if (!ts.isIdentifier(statement.expression.expression)) continue;
    if (statement.expression.expression.text !== "defineConfig") continue;

    const [configArg] = statement.expression.arguments;
    if (configArg && ts.isObjectLiteralExpression(configArg)) {
      return configArg;
    }
  }

  return null;
}

function extractVitestTestStringArray(
  content: string,
  filePath: string,
  propertyName: string,
): string[] {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, false);
  const configObject = findVitestConfigObject(sourceFile);
  if (!configObject) return [];

  const testProperty = getObjectProperty(configObject, "test");
  if (!testProperty || !ts.isPropertyAssignment(testProperty)) return [];
  if (!ts.isObjectLiteralExpression(testProperty.initializer)) return [];

  const targetProperty = getObjectProperty(testProperty.initializer, propertyName);
  if (!targetProperty || !ts.isPropertyAssignment(targetProperty)) return [];

  return readStringArrayFromExpression(targetProperty.initializer);
}

function resolveProjectBase(projectRef: string): string {
  const wildcardIndex = projectRef.search(/[*{[]/);
  return wildcardIndex === -1 ? projectRef : projectRef.slice(0, wildcardIndex).replace(/\/$/, "");
}

function isTestsOnlyIncludePattern(pattern: string): boolean {
  return pattern === "tests" || pattern.startsWith("tests/");
}

function extractImportSpecifiers(content: string, filePath: string): string[] {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, false);
  const imports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    imports.push(statement.moduleSpecifier.text);
  }

  return imports;
}

async function runRepoDoctor(): Promise<DoctorSection> {
  const manifests = await readWorkspacePackageManifests();
  const rootManifest = await readRootManifest();
  const rootScripts = new Set(Object.keys(rootManifest.scripts ?? {}));
  const rootScriptReferenceFiles = [".github/workflows/ci.yml", "README.md"];

  const missingScriptRefs: string[] = [];
  for (const relativePath of rootScriptReferenceFiles) {
    const absolutePath = join(PROJECT_ROOT, relativePath);
    if (!(await checkFile(absolutePath))) continue;
    const content = await readFile(absolutePath, "utf-8");
    for (const scriptName of extractPnpmRunReferences(content)) {
      if (!rootScripts.has(scriptName)) {
        missingScriptRefs.push(`${relativePath} -> ${scriptName}`);
      }
    }
  }

  const vitestConfigPath = join(PROJECT_ROOT, "vitest.config.mts");
  const vitestProjects = (await checkFile(vitestConfigPath))
    ? extractVitestTestStringArray(
        await readFile(vitestConfigPath, "utf-8"),
        vitestConfigPath,
        "projects",
      )
    : [];
  const missingVitestProjects = [];
  for (const projectRef of vitestProjects) {
    const basePath = resolveProjectBase(projectRef);
    if (basePath && !(await checkFile(join(PROJECT_ROOT, basePath)))) {
      missingVitestProjects.push(projectRef);
    }
  }

  const workspaceVitestConfigPaths = await fg(
    [
      "apps/*/vitest.config.{ts,mts}",
      "packages/*/vitest.config.{ts,mts}",
      "tooling/*/vitest.config.{ts,mts}",
    ],
    {
      cwd: PROJECT_ROOT,
      absolute: true,
      onlyFiles: true,
    },
  );

  const invalidVitestIncludes: string[] = [];
  for (const configPath of workspaceVitestConfigPaths) {
    const includePatterns = extractVitestTestStringArray(
      await readFile(configPath, "utf-8"),
      configPath,
      "include",
    );
    if (includePatterns.length === 0 || includePatterns.every(isTestsOnlyIncludePattern)) {
      continue;
    }

    invalidVitestIncludes.push(
      `${configPath.replace(`${PROJECT_ROOT}/`, "")} -> ${includePatterns.join(", ")}`,
    );
  }

  const testsOutsideTestsDirs = await fg(
    [
      "apps/*/src/**/*.{test,spec}.{ts,tsx}",
      "apps/*/__tests__/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/__tests__/**/*.{test,spec}.{ts,tsx}",
      "tooling/*/src/**/*.{test,spec}.{ts,tsx}",
      "tooling/*/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    {
      cwd: PROJECT_ROOT,
      absolute: false,
      onlyFiles: true,
    },
  );

  const testingPolicy = repoPolicy.testing ?? {};
  const operabilityPolicy: OperabilityPolicy = repoPolicy.operability ?? {};
  const requiredTestRoots = testingPolicy.required ?? [];
  const allowNoTestsRoots = testingPolicy.allowNoTests ?? [];
  const classifiedTestRoots = new Set([...requiredTestRoots, ...allowNoTestsRoots]);
  const duplicateClassifiedRoots = [...new Set(requiredTestRoots)].filter((root) =>
    allowNoTestsRoots.includes(root),
  );
  const workspaceRootsWithTestScripts = manifests
    .filter((manifest) => Boolean(manifest.scripts?.test))
    .map((manifest) => manifest.path.replace(`${PROJECT_ROOT}/`, ""))
    .map((manifestPath) => manifestPath.replace(/\/package\.json$/, ""));
  const unknownPolicyRoots = [...classifiedTestRoots].filter(
    (root) => !workspaceRootsWithTestScripts.includes(root),
  );
  const unclassifiedTestRoots = workspaceRootsWithTestScripts.filter(
    (root) => !classifiedTestRoots.has(root),
  );
  const operabilityRequiredScripts = operabilityPolicy.requiredScripts ?? [];
  const operabilityAllowMissingScripts = operabilityPolicy.allowMissingScripts ?? {};
  const buildableRoots = operabilityPolicy.buildable ?? [];
  const sourceOnlyRoots = operabilityPolicy.sourceOnly ?? [];
  const classifiedBuildRoots = new Set([...buildableRoots, ...sourceOnlyRoots]);
  const turboBuildOutputs = readTurboBuildOutputs(
    await readFile(join(PROJECT_ROOT, "turbo.json"), "utf-8"),
  );
  const workspaceRoots = manifests
    .map((manifest) => manifest.path.replace(`${PROJECT_ROOT}/`, ""))
    .map((manifestPath) => manifestPath.replace(/\/package\.json$/, ""));
  const unknownOperabilityRoots = Object.keys(operabilityAllowMissingScripts).filter(
    (root) => !workspaceRoots.includes(root),
  );
  const duplicateOperabilityScripts = Object.entries(operabilityAllowMissingScripts).flatMap(
    ([root, scripts]) => ([...new Set(scripts)].length === scripts.length ? [] : [root]),
  );
  const duplicateBuildClassifications = [...new Set(buildableRoots)].filter((root) =>
    sourceOnlyRoots.includes(root),
  );
  const unknownBuildRoots = [...classifiedBuildRoots].filter(
    (root) => !workspaceRoots.includes(root),
  );
  const unclassifiedBuildRoots = workspaceRoots.filter((root) => !classifiedBuildRoots.has(root));
  const missingOperabilityScripts = manifests.flatMap((manifest) => {
    const root = manifest.path.replace(`${PROJECT_ROOT}/`, "").replace(/\/package\.json$/, "");
    const allowedMissing = new Set(operabilityAllowMissingScripts[root] ?? []);
    return operabilityRequiredScripts
      .filter((script) => !allowedMissing.has(script))
      .filter((script) => !manifest.scripts?.[script])
      .map((script) => `${root} -> ${script}`);
  });
  const missingBuildScripts = manifests.flatMap((manifest) => {
    const root = manifest.path.replace(`${PROJECT_ROOT}/`, "").replace(/\/package\.json$/, "");
    if (!buildableRoots.includes(root)) return [];
    return manifest.scripts?.build ? [] : [`${root} -> build`];
  });
  const invalidTurboBuildOutputs =
    buildableRoots.length > 0 && turboBuildOutputs.length === 0
      ? ["turbo.json -> tasks.build.outputs"]
      : [];
  const missingRequiredTests: string[] = [];
  for (const root of requiredTestRoots) {
    const matches = await fg(["tests/**/*.{test,spec}.{ts,tsx}"], {
      cwd: join(PROJECT_ROOT, root),
      onlyFiles: true,
    });
    if (matches.length === 0) {
      missingRequiredTests.push(root);
    }
  }

  const missingDocLinks: string[] = [];
  for (const relativePath of ["README.md", "CONTRIBUTING.md", "CLAUDE.md"]) {
    const absolutePath = join(PROJECT_ROOT, relativePath);
    if (!(await checkFile(absolutePath))) continue;
    const content = await readFile(absolutePath, "utf-8");
    for (const target of extractMarkdownLinks(content)) {
      if (!(await checkFile(join(PROJECT_ROOT, target)))) {
        missingDocLinks.push(`${relativePath} -> ${target}`);
      }
    }
  }

  const checks: DoctorCheck[] = [
    {
      name: "root-script-references",
      ok: missingScriptRefs.length === 0,
      detail:
        missingScriptRefs.length === 0
          ? "all root script references resolve in docs and CI"
          : `${missingScriptRefs.length} unresolved root script references (${missingScriptRefs[0]})`,
      fixHint: "Update the docs/CI command or add the missing root script to package.json.",
    },
    {
      name: "vitest-projects",
      ok: missingVitestProjects.length === 0,
      detail:
        missingVitestProjects.length === 0
          ? "all Vitest workspace project roots exist"
          : `${missingVitestProjects.length} Vitest project roots are missing (${missingVitestProjects[0]})`,
      fixHint:
        "Remove stale entries from vitest.config.mts or restore the referenced workspace root.",
    },
    {
      name: "test-policy",
      ok:
        duplicateClassifiedRoots.length === 0 &&
        unknownPolicyRoots.length === 0 &&
        unclassifiedTestRoots.length === 0,
      detail:
        duplicateClassifiedRoots.length === 0 &&
        unknownPolicyRoots.length === 0 &&
        unclassifiedTestRoots.length === 0
          ? `${workspaceRootsWithTestScripts.length} workspaces with test scripts are classified in forge repo policy`
          : duplicateClassifiedRoots.length > 0
            ? `duplicate test policy roots (${duplicateClassifiedRoots[0]})`
            : unknownPolicyRoots.length > 0
              ? `forge repo policy references unknown test workspaces (${unknownPolicyRoots[0]})`
              : `${unclassifiedTestRoots.length} workspaces with test scripts are missing from forge repo policy (${unclassifiedTestRoots[0]})`,
      fixHint:
        "Classify every workspace with a test script in tooling/forge/repo-policy.ts under testing.required or testing.allowNoTests.",
    },
    {
      name: "operability-policy",
      ok:
        unknownOperabilityRoots.length === 0 &&
        duplicateOperabilityScripts.length === 0 &&
        missingOperabilityScripts.length === 0,
      detail:
        unknownOperabilityRoots.length === 0 &&
        duplicateOperabilityScripts.length === 0 &&
        missingOperabilityScripts.length === 0
          ? `${workspaceRoots.length} workspaces satisfy required operability scripts`
          : unknownOperabilityRoots.length > 0
            ? `forge repo policy references unknown operability workspaces (${unknownOperabilityRoots[0]})`
            : duplicateOperabilityScripts.length > 0
              ? `duplicate allowed missing operability scripts (${duplicateOperabilityScripts[0]})`
              : `${missingOperabilityScripts.length} required workspace scripts are missing (${missingOperabilityScripts[0]})`,
      fixHint:
        "Add the missing script or explicitly allow it in tooling/forge/repo-policy.ts operability.allowMissingScripts.",
    },
    {
      name: "build-policy",
      ok:
        duplicateBuildClassifications.length === 0 &&
        unknownBuildRoots.length === 0 &&
        unclassifiedBuildRoots.length === 0 &&
        missingBuildScripts.length === 0 &&
        invalidTurboBuildOutputs.length === 0,
      detail:
        duplicateBuildClassifications.length === 0 &&
        unknownBuildRoots.length === 0 &&
        unclassifiedBuildRoots.length === 0 &&
        missingBuildScripts.length === 0 &&
        invalidTurboBuildOutputs.length === 0
          ? `${buildableRoots.length} buildable workspaces and ${sourceOnlyRoots.length} source-only workspaces are classified`
          : duplicateBuildClassifications.length > 0
            ? `duplicate build classifications (${duplicateBuildClassifications[0]})`
            : unknownBuildRoots.length > 0
              ? `forge repo policy references unknown build workspaces (${unknownBuildRoots[0]})`
              : unclassifiedBuildRoots.length > 0
                ? `${unclassifiedBuildRoots.length} workspaces are missing build classification (${unclassifiedBuildRoots[0]})`
                : missingBuildScripts.length > 0
                  ? `${missingBuildScripts.length} buildable workspaces are missing build scripts (${missingBuildScripts[0]})`
                  : `turbo build outputs are not declared (${invalidTurboBuildOutputs[0]})`,
      fixHint:
        "Classify every workspace in tooling/forge/repo-policy.ts as buildable or sourceOnly, add a build script to each buildable workspace, and keep turbo.json tasks.build.outputs declared.",
    },
    {
      name: "workspace-test-layout",
      ok: testsOutsideTestsDirs.length === 0,
      detail:
        testsOutsideTestsDirs.length === 0
          ? "workspace tests live under tests/ directories"
          : `${testsOutsideTestsDirs.length} test files are outside tests/ (${testsOutsideTestsDirs[0]})`,
      fixHint:
        "Move workspace test files into a top-level tests/ directory for each package or app.",
    },
    {
      name: "vitest-include-patterns",
      ok: invalidVitestIncludes.length === 0,
      detail:
        invalidVitestIncludes.length === 0
          ? "workspace Vitest configs target tests/ directories"
          : `${invalidVitestIncludes.length} Vitest configs still include non-tests paths (${invalidVitestIncludes[0]})`,
      fixHint: "Change workspace vitest include patterns to tests/**/*.{test,spec}.{ts,tsx}.",
    },
    {
      name: "required-workspace-tests",
      ok: missingRequiredTests.length === 0,
      detail:
        missingRequiredTests.length === 0
          ? "required workspaces have minimum regression coverage"
          : `${missingRequiredTests.length} required workspaces are missing tests/ coverage (${missingRequiredTests[0]})`,
      fixHint:
        "Add at least one regression test under tests/ for every workspace listed in tooling/forge/repo-policy.ts testing.required.",
    },
    {
      name: "doc-links",
      ok: missingDocLinks.length === 0,
      detail:
        missingDocLinks.length === 0
          ? "all local doc links resolve"
          : `${missingDocLinks.length} local doc links are missing (${missingDocLinks[0]})`,
      fixHint: "Fix the linked path or restore the referenced documentation file.",
    },
  ];

  return {
    name: "repo",
    ok: checks.every((check) => check.ok),
    checks,
  };
}

async function runArchDoctor(): Promise<DoctorSection> {
  const browserFacingFiles = await fg(
    [
      "apps/web/src/components/**/*.{ts,tsx}",
      "apps/web/src/features/**/*.{ts,tsx}",
      "apps/web/src/utils/**/*.{ts,tsx}",
      "apps/web/src/providers.tsx",
    ],
    {
      cwd: PROJECT_ROOT,
      absolute: false,
      onlyFiles: true,
    },
  );

  const forbiddenImports = new Set([
    "@raypx/database",
    "@raypx/database/schemas",
    "@raypx/auth/server",
    "@raypx/admin/server",
    "@raypx/storage",
    "@raypx/stripe",
  ]);

  const violations: string[] = [];
  for (const relativePath of browserFacingFiles) {
    const content = await readFile(join(PROJECT_ROOT, relativePath), "utf-8");
    for (const importPath of extractImportSpecifiers(content, relativePath)) {
      if (forbiddenImports.has(importPath)) {
        violations.push(`${relativePath} -> ${importPath}`);
      }
    }
  }

  const loggerFiles = await fg(["packages/*/src/**/*.ts", "tooling/*/**/*.ts"], {
    cwd: PROJECT_ROOT,
    absolute: false,
    onlyFiles: true,
    ignore: [
      "packages/core/**",
      "tooling/forge/**",
      "tooling/*/node_modules/**",
      "**/*.test.ts",
      "**/*.spec.ts",
    ],
  });
  const directConsolaImports: string[] = [];
  for (const relativePath of loggerFiles) {
    const content = await readFile(join(PROJECT_ROOT, relativePath), "utf-8");
    for (const importPath of extractImportSpecifiers(content, relativePath)) {
      if (importPath === "consola") {
        directConsolaImports.push(relativePath);
      }
    }
  }

  const checks: DoctorCheck[] = [
    {
      name: "web-runtime-boundaries",
      ok: violations.length === 0,
      detail:
        violations.length === 0
          ? "browser-facing web modules avoid direct server/data package imports"
          : `${violations.length} direct backend imports found in browser-facing modules (${violations[0]})`,
      fixHint:
        "Move the access behind @raypx/rpc or a client-safe wrapper instead of importing server/data packages directly.",
    },
    {
      name: "logger-entrypoints",
      ok: directConsolaImports.length === 0,
      detail:
        directConsolaImports.length === 0
          ? "workspace logging uses @raypx/core/logger as the shared logger entrypoint"
          : `${directConsolaImports.length} direct consola imports found outside core (${directConsolaImports[0]})`,
      fixHint:
        "Import logger helpers from @raypx/core/logger instead of depending on consola directly outside packages/core.",
    },
  ];

  return {
    name: "arch",
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

/**
 * Run health checks for the workspace
 */
export async function runDoctor(options: DoctorOptions = {}): Promise<void> {
  const sectionNames: DoctorSectionName[] = options.section
    ? [options.section]
    : ["env", "db", "deps", "repo", "arch"];

  const sectionRunners: Record<DoctorSectionName, () => Promise<DoctorSection>> = {
    env: runEnvDoctor,
    db: runDbDoctor,
    deps: runDepsDoctor,
    repo: runRepoDoctor,
    arch: runArchDoctor,
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
