import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { analyze } from "../../src/core/analyze";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const CHECK_RULE_IDS = new Set([
  "layer-direction",
  "feature-to-feature",
  "public-api",
  "no-barrel",
  "no-cycle",
  "feature-has-inbound",
  "service-no-inbound",
]);

const DOCTOR_RULE_IDS = new Set([
  "shared-candidate",
  "stage-growth",
  "dense-services",
  "orphan-public",
]);

describe("analyze", () => {
  test("clean check has 0 errors", () => {
    const result = analyze(join(fixturesRoot, "clean"), "check");
    expect(
      result.diagnostics.filter((d) => d.severity === "error")
    ).toHaveLength(0);
    expect(result.srcRoot).toBe(join(fixturesRoot, "clean", "src"));
  });

  test("feature-to-feature check reports feature-to-feature", () => {
    const result = analyze(join(fixturesRoot, "feature-to-feature"), "check");
    expect(
      result.diagnostics.some((d) => d.ruleId === "feature-to-feature")
    ).toBe(true);
  });

  test("shared-candidate doctor reports shared-candidate without exit semantics", () => {
    const result = analyze(join(fixturesRoot, "shared-candidate"), "doctor");
    expect(
      result.diagnostics.some((d) => d.ruleId === "shared-candidate")
    ).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        diagnostics: expect.any(Array),
        srcRoot: expect.any(String),
      })
    );
  });

  test("check mode does not emit doctor ruleIds", () => {
    const result = analyze(join(fixturesRoot, "shared-candidate"), "check");
    expect(
      result.diagnostics.every((d) => !DOCTOR_RULE_IDS.has(d.ruleId))
    ).toBe(true);
  });

  test("doctor mode does not emit check ruleIds", () => {
    const result = analyze(join(fixturesRoot, "feature-to-feature"), "doctor");
    expect(result.diagnostics.every((d) => !CHECK_RULE_IDS.has(d.ruleId))).toBe(
      true
    );
  });

  test("doctor reports stage-growth and dense-services fixtures", () => {
    const stage0 = analyze(join(fixturesRoot, "stage-growth-0"), "doctor");
    expect(stage0.diagnostics.some((d) => d.ruleId === "stage-growth")).toBe(
      true
    );

    const dense = analyze(join(fixturesRoot, "dense-services"), "doctor");
    expect(dense.diagnostics.some((d) => d.ruleId === "dense-services")).toBe(
      true
    );
  });
});
