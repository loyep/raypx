import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const packageDir = resolve(process.cwd());
const entry = resolve(packageDir, "index.ts");

function runForge(args: string[], envOverrides: Record<string, string | undefined> = {}) {
  const result = spawnSync(process.execPath, ["--import", "tsx", entry, ...args], {
    cwd: packageDir,
    encoding: "utf-8",
    env: { ...process.env, ...envOverrides },
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

function extractFirstJsonObject(output: string): string {
  const start = output.indexOf("{");
  if (start === -1) {
    throw new Error(`No JSON object found in output:\n${output}`);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < output.length; index += 1) {
    const char = output[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return output.slice(start, index + 1);
      }
    }
  }

  throw new Error(`No complete JSON object found in output:\n${output}`);
}

describe("forge cli", () => {
  it("prints help with no args", () => {
    const result = runForge([]);
    expect(result.status).toBe(0);
    expect(result.output).toContain("forge");
    expect(result.output).toContain("Workspace Commands");
    expect(result.output).toContain("Database Commands");
    expect(result.output).toContain("UI Commands");
    expect(result.output).toContain("clean");
    expect(result.output).toContain("doctor");
  });

  it("supports clean dry-run", async () => {
    const result = runForge(["clean", "--dry-run", "--verbose"]);
    // Verify command executes successfully (consola output may not be captured in test env)
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  }, 30000); // Increase timeout for clean command

  it("prints db help", () => {
    const result = runForge(["db", "--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.output).toContain("Run database operations");
    expect(result.output).toContain("$ forge db <command>");
    expect(result.output).toContain("Examples:");
    expect(result.output).toContain("$ forge db generate");
  });

  it("prints db subcommand help", () => {
    const result = runForge(["db", "seed", "--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.output).toContain("Run db seed");
    expect(result.output).toContain("--dry-run");
    expect(result.output).toContain("Examples:");
  });

  it("supports db dry-run", () => {
    const result = runForge(["db", "generate", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("supports seed dry-run", () => {
    const result = runForge(["db", "seed", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("rejects invalid operation", () => {
    const result = runForge(["db", "invalid-op"]);
    expect(result.status).toBe(1);
    expect(result.output).toContain("Unknown command invalid-op");
  });

  it("passes through args for run command", () => {
    const result = runForge([
      "run",
      "node",
      "-e",
      "console.log(JSON.stringify(process.argv.slice(1)))",
      "--",
      "alpha",
      "beta",
    ]);
    expect(result.status).toBe(0);
    expect(result.output).toContain('["alpha","beta"]');
  });

  it("prints doctor json output", () => {
    const result = runForge(["doctor", "--json"]);
    expect([0, 1]).toContain(result.status);
    const parsed = JSON.parse(extractFirstJsonObject(result.output));
    expect(parsed).toMatchObject({
      summary: expect.any(Object),
      sections: expect.any(Array),
    });
    expect(parsed.sections.map((section: { name: string }) => section.name)).toEqual(
      expect.arrayContaining(["env", "deps", "repo", "arch"]),
    );
  });

  it("supports scoped doctor output", () => {
    const result = runForge(["doctor", "env", "--json"]);
    expect([0, 1]).toContain(result.status);
    const parsed = JSON.parse(extractFirstJsonObject(result.output));
    expect(parsed.sections).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "env" })]),
    );
  });

  it("prints doctor help with supported sections", () => {
    const result = runForge(["doctor", "--help"]);
    expect(result.status).toBe(0);
    expect(result.output).toContain("forge doctor");
    expect(result.output).toContain("Commands:");
    expect(result.output).toContain("env");
    expect(result.output).toContain("repo");
    expect(result.output).toContain("arch");
    expect(result.output).toContain("Print structured JSON output");
    expect(result.output).toContain("Examples:");
  });

  it("rejects invalid doctor section", () => {
    const result = runForge(["doctor", "invalid"]);
    expect(result.status).toBe(1);
    expect(result.output).toContain("Unknown command invalid");
  });

  it("fails doctor db without database env", () => {
    const result = runForge(["doctor", "db"], {
      DATABASE_URL: "",
      DIRECT_URL: "",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("DATABASE_URL and DIRECT_URL are missing");
  });

  it("prints doctor deps summary in json output", () => {
    const result = runForge(["doctor", "deps", "--json"], {
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
    });
    expect([0, 1]).toContain(result.status);
    const parsed = JSON.parse(extractFirstJsonObject(result.output));
    const depsSection = parsed.sections.find((section: { name: string }) => section.name === "deps");
    expect(depsSection).toBeDefined();
    expect(JSON.stringify(depsSection)).toContain("workspace-dependencies");
  });

  it("supports setup", () => {
    const result = runForge(["setup", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("supports prepare", () => {
    const result = runForge(["prepare", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });
});
