import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function getCliDistDir(): string {
  // Resolve relative to this file's location (which is in dist/ after build)
  const thisFile = fileURLToPath(import.meta.url);
  return dirname(thisFile);
}

export function getWorkerBundlePath(): string {
  const bundlePath = resolve(getCliDistDir(), "worker-bundle", "app-dist");
  if (!existsSync(bundlePath)) {
    throw new Error(
      `Worker bundle not found at ${bundlePath}. The CLI may not have been built correctly.`,
    );
  }
  return bundlePath;
}

export function getMigrationsPath(): string {
  const migrationsPath = resolve(
    getCliDistDir(),
    "worker-bundle",
    "migrations",
  );
  if (!existsSync(migrationsPath)) {
    throw new Error(
      `Migrations not found at ${migrationsPath}. The CLI may not have been built correctly.`,
    );
  }
  return migrationsPath;
}
