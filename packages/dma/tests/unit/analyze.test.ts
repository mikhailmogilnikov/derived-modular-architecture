import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { analyze } from "../../src/core/analyze";

const fixturesRoot = join(import.meta.dir, "../fixtures");

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
});
