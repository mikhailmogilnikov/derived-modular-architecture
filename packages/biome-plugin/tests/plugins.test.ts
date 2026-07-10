import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

describe("@derived-modular/biome-plugin", () => {
  test("grit plugins report expected fixture violations", () => {
    const result = spawnSync(
      "bunx",
      ["@biomejs/biome", "check", "tests/fixtures"],
      {
        cwd: root,
        encoding: "utf8",
      }
    );
    const out = `${result.stdout}\n${result.stderr}`;
    expect(out).toContain("no-barrel");
    expect(out).toContain("feature-to-feature");
    expect(out).toContain("public-api");
    expect(out).toContain("layer-direction");
    expect(result.status).not.toBe(0);
  });
});
