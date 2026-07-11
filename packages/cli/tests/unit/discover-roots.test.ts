import { describe, expect, test } from "bun:test";
import { join, resolve } from "node:path";
import { discoverRoots, isDmaRoot } from "../../src/core/discover-roots";

const miniMonorepo = join(import.meta.dir, "../fixtures/mini-monorepo");
const miniWalk = join(import.meta.dir, "../fixtures/mini-monorepo-walk");
const miniPnpm = join(import.meta.dir, "../fixtures/mini-monorepo-pnpm");

describe("discoverRoots", () => {
  test("workspaces default finds apps only", () => {
    const roots = discoverRoots({
      includePackages: false,
      searchRoot: miniMonorepo,
    });
    expect(roots).toEqual([
      resolve(miniMonorepo, "apps/admin"),
      resolve(miniMonorepo, "apps/web"),
    ]);
  });

  test("includePackages adds library package without composition root", () => {
    const roots = discoverRoots({
      includePackages: true,
      searchRoot: miniMonorepo,
    });
    expect(roots).toEqual([
      resolve(miniMonorepo, "apps/admin"),
      resolve(miniMonorepo, "apps/web"),
      resolve(miniMonorepo, "packages/cart"),
    ]);
  });

  test("walk fallback finds apps without workspaces", () => {
    const roots = discoverRoots({
      includePackages: false,
      searchRoot: miniWalk,
    });
    expect(roots).toEqual([
      resolve(miniWalk, "apps/admin"),
      resolve(miniWalk, "apps/web"),
    ]);
  });

  test("pnpm-workspace.yaml finds apps", () => {
    const roots = discoverRoots({
      includePackages: false,
      searchRoot: miniPnpm,
    });
    expect(roots).toEqual([resolve(miniPnpm, "apps/web")]);
  });

  test("empty search returns []", () => {
    const empty = join(miniMonorepo, "packages");
    const roots = discoverRoots({
      includePackages: false,
      searchRoot: empty,
    });
    expect(roots).toEqual([]);
  });

  test("isDmaRoot distinguishes apps vs packages", () => {
    expect(isDmaRoot(join(miniMonorepo, "apps/web"), false)).toBe(true);
    expect(isDmaRoot(join(miniMonorepo, "packages/cart"), false)).toBe(false);
    expect(isDmaRoot(join(miniMonorepo, "packages/cart"), true)).toBe(true);
  });
});
