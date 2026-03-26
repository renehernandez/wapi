import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface WranglerConfig {
  $schema?: string;
  name?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
  main?: string;
  observability?: { enabled: boolean };
  d1_databases?: Array<{
    binding: string;
    database_name: string;
    database_id: string;
    migrations_dir?: string;
  }>;
  kv_namespaces?: Array<{ binding: string; id: string }>;
  r2_buckets?: Array<{ binding: string; bucket_name: string }>;
  durable_objects?: {
    bindings: Array<{ name: string; class_name: string }>;
  };
  migrations?: Array<{ tag: string; new_sqlite_classes: string[] }>;
  routes?: Array<{ pattern: string; zone_name: string }>;
}

/**
 * Build the default wrangler config object. When a custom domain is provided,
 * a `routes` entry is added and the zone name is derived by dropping the first
 * subdomain label (e.g. "wapi.fullscript.cloud" → zone "fullscript.cloud").
 */
export function defaultWranglerConfig(options?: {
  domain?: string;
}): WranglerConfig {
  const config: WranglerConfig = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: "wapi",
    compatibility_date: "2026-03-17",
    compatibility_flags: ["nodejs_compat"],
    main: "dist/@tanstack/react-start/server-entry",
    observability: { enabled: true },
    d1_databases: [
      {
        binding: "DB",
        database_name: "wapi-db",
        database_id: "<will be filled by wapi init>",
        migrations_dir: "./migrations",
      },
    ],
    kv_namespaces: [
      {
        binding: "KV",
        id: "<will be filled by wapi init>",
      },
    ],
    r2_buckets: [
      {
        binding: "R2",
        bucket_name: "wapi-storage",
      },
    ],
    durable_objects: {
      bindings: [
        { name: "UserRoom", class_name: "UserRoom" },
        { name: "SessionRoom", class_name: "SessionRoom" },
      ],
    },
    migrations: [
      {
        tag: "v1",
        new_sqlite_classes: ["UserRoom", "SessionRoom"],
      },
    ],
  };

  if (options?.domain) {
    const domain = options.domain;
    const parts = domain.split(".");
    // Zone name = everything after the first label (drop the subdomain)
    const zoneName = parts.length > 2 ? parts.slice(1).join(".") : domain;
    config.routes = [{ pattern: `${domain}/*`, zone_name: zoneName }];
  }

  return config;
}

/**
 * Write a starter `wrangler.jsonc` to the given directory with placeholder
 * resource IDs. Returns the path of the written file.
 */
export function generateWranglerConfig(
  dir: string,
  options?: { domain?: string },
): string {
  const config = defaultWranglerConfig(options);
  const filePath = join(dir, "wrangler.jsonc");
  writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
  return filePath;
}

/**
 * Patch resource IDs into an existing `wrangler.jsonc` without clobbering
 * other fields. Comments in the file will be lost on write — this is
 * acceptable since we generate valid JSON without comments.
 */
export function patchWranglerConfig(
  filePath: string,
  updates: {
    d1DatabaseId?: string;
    kvNamespaceId?: string;
    r2BucketName?: string;
  },
): void {
  const raw = readFileSync(filePath, "utf-8");
  // Strip single-line // comments before parsing
  const stripped = raw.replace(/^\s*\/\/.*$/gm, "");
  const config = JSON.parse(stripped) as WranglerConfig;

  if (updates.d1DatabaseId && config.d1_databases?.[0]) {
    config.d1_databases[0].database_id = updates.d1DatabaseId;
  }

  if (updates.kvNamespaceId && config.kv_namespaces?.[0]) {
    config.kv_namespaces[0].id = updates.kvNamespaceId;
  }

  if (updates.r2BucketName && config.r2_buckets?.[0]) {
    config.r2_buckets[0].bucket_name = updates.r2BucketName;
  }

  writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Check if the wrangler.jsonc at `filePath` still has placeholder IDs that
 * need to be filled by provisioning.
 */
export function needsProvisioning(filePath: string): {
  d1: boolean;
  kv: boolean;
  r2: boolean;
} {
  const raw = readFileSync(filePath, "utf-8");
  const stripped = raw.replace(/^\s*\/\/.*$/gm, "");
  const config = JSON.parse(stripped) as WranglerConfig;

  const d1Id = config.d1_databases?.[0]?.database_id ?? "";
  const kvId = config.kv_namespaces?.[0]?.id ?? "";

  return {
    d1: d1Id === "" || d1Id.startsWith("<"),
    kv: kvId === "" || kvId.startsWith("<"),
    // R2 uses a bucket name (always a string), so it never needs provisioning
    // in the same way — the bucket is identified by name, not ID.
    r2: false,
  };
}
