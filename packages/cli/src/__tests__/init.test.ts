import { describe, expect, it } from "vitest";
import { parseDeployUrl } from "../commands/init";
import { defaultWranglerConfig } from "../deploy/scaffold";

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

describe("zone name extraction from domain", () => {
  it("extracts zone name by dropping the first subdomain label", () => {
    const config = defaultWranglerConfig({ domain: "wapi.fullscript.cloud" });
    expect(config.routes?.[0]?.zone_name).toBe("fullscript.cloud");
  });

  it("handles a three-part domain correctly", () => {
    const config = defaultWranglerConfig({ domain: "wapi.example.com" });
    expect(config.routes?.[0]?.zone_name).toBe("example.com");
  });

  it("handles a four-part domain (multi-level TLD)", () => {
    const config = defaultWranglerConfig({ domain: "wapi.example.co.uk" });
    expect(config.routes?.[0]?.zone_name).toBe("example.co.uk");
  });

  it("uses the domain itself as zone when only two parts", () => {
    // Edge case: bare two-part domain — zone stays the same as domain
    const config = defaultWranglerConfig({ domain: "example.com" });
    expect(config.routes?.[0]?.zone_name).toBe("example.com");
  });

  it("does not add routes when no domain is provided", () => {
    const config = defaultWranglerConfig();
    expect(config.routes).toBeUndefined();
  });
});
