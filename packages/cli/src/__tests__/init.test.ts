import { describe, expect, it } from "vitest";
import { parseD1Id, parseDeployUrl, parseKvId } from "../commands/init";

describe("parseD1Id", () => {
  it("parses database_id from wrangler d1 create output", () => {
    const output = `
✅ Successfully created DB 'wapi-db' in region ENAM
Created your new D1 database.

[[d1_databases]]
binding = "DB"
database_name = "wapi-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
`;
    expect(parseD1Id(output)).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  });

  it("returns null for unexpected output", () => {
    expect(parseD1Id("some random output")).toBeNull();
  });
});

describe("parseKvId", () => {
  it("parses id from wrangler kv namespace create output", () => {
    const output = `
🌀 Creating namespace with title "wapi-wapi-kv"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "KV"
id = "abcdef1234567890abcdef1234567890"
`;
    expect(parseKvId(output)).toBe("abcdef1234567890abcdef1234567890");
  });

  it("returns null for unexpected output", () => {
    expect(parseKvId("no id here")).toBeNull();
  });
});

describe("parseDeployUrl", () => {
  it("parses workers.dev URL from deploy output", () => {
    const output = `
Total Upload: 150.00 KiB / gzip: 50.00 KiB
Uploaded wapi (1.23 sec)
Published wapi (0.45 sec)
  https://wapi.my-subdomain.workers.dev
`;
    expect(parseDeployUrl(output)).toBe(
      "https://wapi.my-subdomain.workers.dev",
    );
  });

  it("returns null when no URL found", () => {
    expect(parseDeployUrl("deployed successfully")).toBeNull();
  });
});
