import { describe, expect, test } from "bun:test";
import { join, resolve } from "node:path";
import type { CliArgs } from "../../src/cli/parse-args";
import { resolveRoots } from "../../src/cli/resolve-roots";
import type { ResolvedDmaOptions } from "../../src/core/config-types";
import { DEFAULT_DMA_CONFIG } from "../../src/core/config-types";
import { DmaEnvironmentError } from "../../src/core/errors";

const miniMonorepo = join(import.meta.dir, "../fixtures/mini-monorepo");
const fixtureClean = join(import.meta.dir, "../fixtures/clean");

const baseArgs = (overrides: Partial<CliArgs> = {}): CliArgs => ({
  command: "check",
  format: "json",
  includePackages: false,
  includePackagesExplicit: false,
  path: fixtureClean,
  ...overrides,
});

const baseOptions = (
  overrides: Partial<ResolvedDmaOptions> = {}
): ResolvedDmaOptions => ({
  compositionRoots: DEFAULT_DMA_CONFIG.compositionRoots,
  includePackages: DEFAULT_DMA_CONFIG.includePackages,
  srcRoot: DEFAULT_DMA_CONFIG.srcRoot,
  ...overrides,
});

describe("resolveRoots", () => {
  test("single-root when path has src/", () => {
    const roots = resolveRoots(baseArgs(), baseOptions());
    expect(roots).toEqual([resolve(fixtureClean)]);
  });

  test("discovers apps when path has no src/", () => {
    const roots = resolveRoots(baseArgs({ path: miniMonorepo }), baseOptions());
    expect(roots).toEqual([
      resolve(miniMonorepo, "apps/admin"),
      resolve(miniMonorepo, "apps/web"),
    ]);
  });

  test("--roots validates src/ and ignores path", () => {
    const web = join(miniMonorepo, "apps/web");
    const roots = resolveRoots(
      baseArgs({ path: miniMonorepo, roots: [web] }),
      baseOptions({ roots: [resolve(web)] })
    );
    expect(roots).toEqual([resolve(web)]);
  });

  test("--roots without src/ throws", () => {
    expect(() =>
      resolveRoots(
        baseArgs({ path: ".", roots: [miniMonorepo] }),
        baseOptions({ roots: [resolve(miniMonorepo)] })
      )
    ).toThrow(DmaEnvironmentError);
  });

  test("includePackages on discover adds cart", () => {
    const roots = resolveRoots(
      baseArgs({ path: miniMonorepo }),
      baseOptions({ includePackages: true })
    );
    expect(roots).toContain(resolve(miniMonorepo, "packages/cart"));
  });
});
