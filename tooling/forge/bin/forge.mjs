#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cwd = process.cwd();
const args = process.argv.slice(2);
const entry = resolve(__dirname, "../index.ts");

const child = spawn(process.execPath, ["--import", "tsx", entry, ...args], {
  cwd,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
