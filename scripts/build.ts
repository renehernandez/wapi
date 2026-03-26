#!/usr/bin/env tsx
/**
 * Build orchestrator: builds the app, copies Worker output to CLI, then builds CLI.
 *
 * Usage: tsx scripts/build.ts
 */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const APP_DIR = resolve(ROOT, "app");
const CLI_DIR = resolve(ROOT, "packages/cli");
const APP_OUTPUT = resolve(APP_DIR, ".output");
const APP_MIGRATIONS = resolve(APP_DIR, "db/migrations");
const BUNDLE_TARGET = resolve(CLI_DIR, "dist/worker-bundle");

function run(cmd: string, cwd: string) {
  console.log(`\n> ${cmd} (in ${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

// Step 1: Build the app
console.log("\n=== Step 1: Building app ===");
run("npx vite build", APP_DIR);

if (!existsSync(APP_OUTPUT)) {
  console.error("ERROR: app/.output/ not found after build");
  process.exit(1);
}

// Step 2: Copy Worker output + migrations to CLI package
console.log("\n=== Step 2: Copying Worker bundle to CLI ===");
if (existsSync(BUNDLE_TARGET)) {
  rmSync(BUNDLE_TARGET, { recursive: true });
}
mkdirSync(BUNDLE_TARGET, { recursive: true });

cpSync(APP_OUTPUT, resolve(BUNDLE_TARGET, "output"), { recursive: true });
cpSync(APP_MIGRATIONS, resolve(BUNDLE_TARGET, "migrations"), {
  recursive: true,
});

console.log(`Copied to ${BUNDLE_TARGET}`);

// Step 3: Build the CLI
console.log("\n=== Step 3: Building CLI ===");
run("npx tsup", CLI_DIR);

console.log("\n=== Build complete ===");
console.log(`CLI: ${CLI_DIR}/dist/index.js`);
console.log(`Worker bundle: ${BUNDLE_TARGET}/`);
