import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  defaultWranglerConfig,
  generateWranglerConfig,
  needsProvisioning,
  patchWranglerConfig,
} from "../deploy/scaffold";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "wapi-scaffold-test-"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("defaultWranglerConfig", () => {
  it("produces the required bindings without a domain", () => {
    const config = defaultWranglerConfig();
    expect(config.name).toBe("wapi");
    expect(config.compatibility_flags).toContain("nodejs_compat");
    expect(config.d1_databases?.[0]?.binding).toBe("DB");
    expect(config.kv_namespaces?.[0]?.binding).toBe("KV");
    expect(config.r2_buckets?.[0]?.binding).toBe("R2");
    expect(config.durable_objects?.bindings).toHaveLength(2);
    expect(config.routes).toBeUndefined();
  });

  it("adds routes when domain is provided", () => {
    const config = defaultWranglerConfig({ domain: "wapi.fullscript.cloud" });
    expect(config.routes).toHaveLength(1);
    expect(config.routes?.[0]?.pattern).toBe("wapi.fullscript.cloud/*");
    expect(config.routes?.[0]?.zone_name).toBe("fullscript.cloud");
  });

  it("derives zone name from multi-part TLD", () => {
    const config = defaultWranglerConfig({ domain: "wapi.example.co.uk" });
    expect(config.routes?.[0]?.zone_name).toBe("example.co.uk");
  });

  it("includes placeholder IDs by default", () => {
    const config = defaultWranglerConfig();
    expect(config.d1_databases?.[0]?.database_id).toMatch(/^</);
    expect(config.kv_namespaces?.[0]?.id).toMatch(/^</);
  });
});

describe("generateWranglerConfig", () => {
  it("writes a valid JSON file with all required bindings", () => {
    const filePath = generateWranglerConfig(tmpDir);
    const raw = readFileSync(filePath, "utf-8");
    const config = JSON.parse(raw);

    expect(config.name).toBe("wapi");
    expect(config.d1_databases?.[0]?.binding).toBe("DB");
    expect(config.kv_namespaces?.[0]?.binding).toBe("KV");
    expect(config.r2_buckets?.[0]?.binding).toBe("R2");
    expect(config.durable_objects?.bindings).toHaveLength(2);
  });

  it("returns the path of the written file", () => {
    const filePath = generateWranglerConfig(tmpDir);
    expect(filePath).toBe(join(tmpDir, "wrangler.jsonc"));
  });

  it("adds routes when domain option is given", () => {
    const filePath = generateWranglerConfig(tmpDir, {
      domain: "wapi.example.com",
    });
    const config = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(config.routes?.[0]?.pattern).toBe("wapi.example.com/*");
    expect(config.routes?.[0]?.zone_name).toBe("example.com");
  });
});

describe("patchWranglerConfig", () => {
  it("fills in D1 database ID", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, { d1DatabaseId: "abc-123-uuid" });

    const config = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(config.d1_databases?.[0]?.database_id).toBe("abc-123-uuid");
  });

  it("fills in KV namespace ID", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, { kvNamespaceId: "kv-id-xyz" });

    const config = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(config.kv_namespaces?.[0]?.id).toBe("kv-id-xyz");
  });

  it("fills in R2 bucket name", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, { r2BucketName: "my-custom-bucket" });

    const config = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(config.r2_buckets?.[0]?.bucket_name).toBe("my-custom-bucket");
  });

  it("preserves other fields when patching IDs", () => {
    const filePath = generateWranglerConfig(tmpDir, {
      domain: "wapi.example.com",
    });
    patchWranglerConfig(filePath, {
      d1DatabaseId: "d1-id",
      kvNamespaceId: "kv-id",
    });

    const config = JSON.parse(readFileSync(filePath, "utf-8"));
    // Routes and worker name should be unchanged
    expect(config.name).toBe("wapi");
    expect(config.routes?.[0]?.pattern).toBe("wapi.example.com/*");
    // Patched values should be present
    expect(config.d1_databases?.[0]?.database_id).toBe("d1-id");
    expect(config.kv_namespaces?.[0]?.id).toBe("kv-id");
  });
});

describe("needsProvisioning", () => {
  it("detects placeholder D1 and KV IDs", () => {
    const filePath = generateWranglerConfig(tmpDir);
    const result = needsProvisioning(filePath);
    expect(result.d1).toBe(true);
    expect(result.kv).toBe(true);
  });

  it("returns false for d1 when a real ID is present", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, { d1DatabaseId: "real-d1-id-abc123" });
    const result = needsProvisioning(filePath);
    expect(result.d1).toBe(false);
  });

  it("returns false for kv when a real ID is present", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, { kvNamespaceId: "real-kv-id-def456" });
    const result = needsProvisioning(filePath);
    expect(result.kv).toBe(false);
  });

  it("always returns false for r2 (bucket identified by name, not ID)", () => {
    const filePath = generateWranglerConfig(tmpDir);
    const result = needsProvisioning(filePath);
    expect(result.r2).toBe(false);
  });

  it("returns all false when all IDs are real", () => {
    const filePath = generateWranglerConfig(tmpDir);
    patchWranglerConfig(filePath, {
      d1DatabaseId: "real-d1-id",
      kvNamespaceId: "real-kv-id",
    });
    const result = needsProvisioning(filePath);
    expect(result.d1).toBe(false);
    expect(result.kv).toBe(false);
    expect(result.r2).toBe(false);
  });

  it("handles empty string IDs as needing provisioning", () => {
    const config = {
      d1_databases: [{ database_id: "" }],
      kv_namespaces: [{ id: "" }],
    };
    const filePath = join(tmpDir, "wrangler.jsonc");
    writeFileSync(filePath, JSON.stringify(config));
    const result = needsProvisioning(filePath);
    expect(result.d1).toBe(true);
    expect(result.kv).toBe(true);
  });
});
