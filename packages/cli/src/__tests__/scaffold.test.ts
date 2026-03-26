import { describe, expect, it } from "vitest";
import { getWranglerTemplate } from "../bundle";
import { substituteTemplate } from "../deploy/scaffold";

describe("substituteTemplate", () => {
  it("replaces D1 and KV placeholders", () => {
    const template = getWranglerTemplate();
    const result = substituteTemplate(template, "abc-123", "def-456");

    expect(result).toContain('"database_id": "abc-123"');
    expect(result).toContain('"id": "def-456"');
    expect(result).not.toContain("DATABASE_ID_PLACEHOLDER");
    expect(result).not.toContain("KV_ID_PLACEHOLDER");
  });
});

describe("getWranglerTemplate", () => {
  it("returns valid JSON template with placeholders", () => {
    const template = getWranglerTemplate();
    expect(template).toContain("DATABASE_ID_PLACEHOLDER");
    expect(template).toContain("KV_ID_PLACEHOLDER");
    expect(template).toContain('"name": "wapi"');
    expect(template).toContain("UserRoom");
    expect(template).toContain("SessionRoom");
  });

  it("is valid JSON", () => {
    const template = getWranglerTemplate();
    expect(() => JSON.parse(template)).not.toThrow();
  });
});
