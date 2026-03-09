import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const packageDir = resolve(process.cwd());
const entry = resolve(packageDir, "src/cli/index.ts");

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

describe("forge cli", () => {
  it("prints help with no args", () => {
    const result = runForge([]);
    expect(result.status).toBe(0);
    expect(result.output).toContain("forge");
    expect(result.output).toContain("doctor");
  });

  it("prints db help", () => {
    const result = runForge(["db", "--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.output).toContain("db seed --dry-run");
    expect(result.output).toContain("db studio");
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
    expect(result.output).toContain("Invalid operation");
  });

  it("rejects extra args for db command", () => {
    const result = runForge(["db", "studio", "main"]);
    expect(result.status).toBe(1);
    expect(result.output).toContain("Unexpected arguments");
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
    expect(result.status).toBe(0);
    expect(result.output).toContain('"summary"');
    expect(result.output).toContain('"sections"');
    expect(result.output).toContain('"env"');
    expect(result.output).toContain('"deps"');
  });

  it("supports scoped doctor output", () => {
    const result = runForge(["doctor", "env", "--json"]);
    expect(result.status).toBe(0);
    expect(result.output).toContain('"name": "env"');
  });

  it("prints doctor help with supported sections", () => {
    const result = runForge(["doctor", "--help"]);
    expect(result.status).toBe(0);
    expect(result.output).toContain("doctor [env|db|deps] [--json]");
    expect(result.output).toContain("doctor env");
    expect(result.output).toContain("runtime binaries, workspace files, and .env");
    expect(result.output).toContain("database package files, config, and env vars");
  });

  it("rejects invalid doctor section", () => {
    const result = runForge(["doctor", "invalid"]);
    expect(result.status).toBe(1);
    expect(result.output).toContain("Invalid doctor section");
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
    expect(result.status).toBe(0);
    expect(result.output).toContain('"summary"');
    expect(result.output).toContain('"workspace-dependencies"');
  });

  it("supports setup", () => {
    const result = runForge(["setup", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });
});
