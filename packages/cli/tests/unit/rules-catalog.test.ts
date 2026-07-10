import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CHECK_RULE_IDS = [
  "layer-direction",
  "feature-to-feature",
  "public-api",
  "no-barrel",
  "no-cycle",
  "feature-has-inbound",
  "service-no-inbound",
] as const;

const DOCTOR_RULE_IDS = [
  "shared-candidate",
  "stage-growth",
  "dense-services",
  "orphan-public",
] as const;

describe("spec/rules.json catalog", () => {
  const catalogPath = join(import.meta.dir, "../../../../spec/rules.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as {
    version: number;
    rules: Array<{ id: string; surfaces: string[] }>;
  };
  const ids = new Set(catalog.rules.map((rule) => rule.id));

  test("includes every check ruleId", () => {
    for (const id of CHECK_RULE_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  test("includes every doctor ruleId", () => {
    for (const id of DOCTOR_RULE_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  test("check rules list check surface", () => {
    for (const id of CHECK_RULE_IDS) {
      const rule = catalog.rules.find((entry) => entry.id === id);
      expect(rule?.surfaces.includes("check")).toBe(true);
    }
  });
});
