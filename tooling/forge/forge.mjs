#!/usr/bin/env node

import { mkdirSync, appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = process.cwd();
const args = process.argv.slice(2);
const logFile = resolve(cwd, ".cache/raypx-forge/commands.log");
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

mkdirSync(dirname(logFile), { recursive: true });

function writeLog(message) {
  appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
}

const entry = resolve(__dirname, "src/cli/index.ts");

writeLog(`START cwd="${cwd}" args="${args.join(" ")}"`);

const child = spawn(process.execPath, ["--import", "tsx", entry, ...args], {
  cwd,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  const exitCode = code ?? 1;
  writeLog(`END code=${exitCode}${signal ? ` signal=${signal}` : ""}`);
  process.exit(exitCode);
});

child.on("error", (error) => {
  writeLog(`ERROR message="${error.message}"`);
  process.exit(1);
});
