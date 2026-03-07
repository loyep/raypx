import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const packageDir = resolve(process.cwd());
const entry = resolve(packageDir, "src/cli/index.ts");

function runForge(args: string[]) {
  const result = spawnSync(process.execPath, ["--import", "tsx", entry, ...args], {
    cwd: packageDir,
    encoding: "utf-8",
    env: process.env,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

describe("forge cli", () => {
  it("prints db help", () => {
    const result = runForge(["db", "--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("supports db dry-run", () => {
    const result = runForge(["db", "generate", "--dry-run", "--verbose"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("supports check-ai dry-run", () => {
    const result = runForge(["db", "check-ai", "--dry-run", "--verbose"]);
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
    expect(result.output).toContain('"checks"');
    expect(result.output).toContain('"node"');
    expect(result.output).toContain('"pnpm"');
  });
});
