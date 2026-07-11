import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { runCli } from "../../src/cli/run";

const fixtureFeatureToFeature = join(
  import.meta.dir,
  "../fixtures/feature-to-feature"
);

describe("golden check-dirty", () => {
  test("check feature-to-feature fixture exits 1", async () => {
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = (() => true) as typeof process.stdout.write;
    try {
      const code = await runCli([
        "check",
        fixtureFeatureToFeature,
        "--format",
        "json",
      ]);
      expect(code).toBe(1);
    } finally {
      process.stdout.write = original;
    }
  });
});
