import { describe, expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { resolveRoots } from "../../src/cli/resolve-roots";
import { DmaEnvironmentError } from "../../src/core/errors";

const miniMonorepo = join(import.meta.dir, "../fixtures/mini-monorepo");
const fixtureClean = join(import.meta.dir, "../fixtures/clean");

describe("resolveRoots", () => {
  test("single-root when path has src/", () => {
    const roots = resolveRoots({
      command: "check",
      format: "json",
      includePackages: false,
      path: fixtureClean,
    });
    expect(roots).toEqual([resolve(fixtureClean)]);
  });

  test("discovers apps when path has no src/", () => {
    const roots = resolveRoots({
      command: "check",
      format: "json",
      includePackages: false,
      path: miniMonorepo,
    });
    expect(roots).toEqual([
      resolve(miniMonorepo, "apps/admin"),
      resolve(miniMonorepo, "apps/web"),
    ]);
  });

  test("--roots validates src/ and ignores path", () => {
    const roots = resolveRoots({
      command: "check",
      format: "json",
      includePackages: true,
      path: miniMonorepo,
      roots: [join(miniMonorepo, "apps/web")],
    });
    expect(roots).toEqual([resolve(miniMonorepo, "apps/web")]);
  });

  test("--roots without src/ throws", () => {
    expect(() =>
      resolveRoots({
        command: "check",
        format: "json",
        includePackages: false,
        path: ".",
        roots: [miniMonorepo],
      })
    ).toThrow(DmaEnvironmentError);
  });

  test("includePackages on discover adds cart", () => {
    const roots = resolveRoots({
      command: "check",
      format: "json",
      includePackages: true,
      path: miniMonorepo,
    });
    expect(roots).toContain(resolve(miniMonorepo, "packages/cart"));
  });
});
