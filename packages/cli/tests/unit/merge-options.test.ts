import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { mergeOptions } from "../../src/cli/merge-options";
import type { CliArgs } from "../../src/cli/parse-args";
import type { LoadedConfig } from "../../src/core/load-config";

const baseArgs = (overrides: Partial<CliArgs> = {}): CliArgs => ({
  command: "check",
  format: "json",
  includePackages: false,
  includePackagesExplicit: false,
  path: ".",
  ...overrides,
});

describe("mergeOptions", () => {
  test("defaults when no config", () => {
    const options = mergeOptions(baseArgs());
    expect(options.srcRoot).toBe("src");
    expect(options.compositionRoots).toContain("app");
    expect(options.includePackages).toBe(false);
    expect(options.roots).toBeUndefined();
  });

  test("config supplies roots relative to configDir", () => {
    const loaded: LoadedConfig = {
      config: { roots: ["apps/web"] },
      configDir: "/repo",
      configPath: "/repo/dma.config.json",
    };
    const options = mergeOptions(baseArgs(), loaded);
    expect(options.roots).toEqual([resolve("/repo", "apps/web")]);
  });

  test("CLI --roots overrides config roots", () => {
    const loaded: LoadedConfig = {
      config: { roots: ["apps/web"] },
      configDir: "/repo",
      configPath: "/repo/dma.config.json",
    };
    const options = mergeOptions(baseArgs({ roots: ["apps/admin"] }), loaded);
    expect(options.roots).toEqual([resolve("apps/admin")]);
  });

  test("CLI --include-packages overrides config", () => {
    const loaded: LoadedConfig = {
      config: { includePackages: false },
      configDir: "/repo",
      configPath: "/repo/dma.config.json",
    };
    const options = mergeOptions(
      baseArgs({
        includePackages: true,
        includePackagesExplicit: true,
      }),
      loaded
    );
    expect(options.includePackages).toBe(true);
  });

  test("config includePackages used when flag absent", () => {
    const loaded: LoadedConfig = {
      config: { includePackages: true },
      configDir: "/repo",
      configPath: "/repo/dma.config.json",
    };
    const options = mergeOptions(baseArgs(), loaded);
    expect(options.includePackages).toBe(true);
  });
});
