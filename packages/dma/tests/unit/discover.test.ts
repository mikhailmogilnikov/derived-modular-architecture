import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { discover } from "../../src/core/discover";

const fixture = join(import.meta.dir, "../fixtures/clean");

describe("discover", () => {
  test("finds layers and modules", () => {
    const project = discover(fixture);
    expect(project.layers.features).toBeTruthy();
    expect(
      project.modules.some((m) => m.name === "profile" && m.kind === "file")
    ).toBe(true);
    expect(
      project.modules.some((m) => m.name === "checkout" && m.kind === "dir")
    ).toBe(true);
    expect(
      project.modules.every(
        (m) => m.layer === "features" || m.layer === "services"
      )
    ).toBe(true);
  });

  test("throws when src missing", () => {
    expect(() => discover(import.meta.dir)).toThrow();
  });
});
