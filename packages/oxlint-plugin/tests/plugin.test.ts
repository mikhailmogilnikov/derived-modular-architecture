import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const fixture = join(root, "tests/fixtures/barrel");

describe("@derived-modular/oxlint-plugin", () => {
  test("recommended config reports no-barrel via eslint-plugin", () => {
    const result = spawnSync(
      "bunx",
      ["oxlint", "-c", join(fixture, ".oxlintrc.json"), join(fixture, "src")],
      { cwd: root, encoding: "utf8" }
    );
    const out = `${result.stdout}\n${result.stderr}`;
    expect(out).toContain("no-barrel");
    expect(result.status).not.toBe(0);
  });
});
