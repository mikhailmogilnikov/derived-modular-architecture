import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { DmaEnvironmentError } from "../../src/core/errors";
import {
  findConfigPath,
  loadConfig,
  validateDmaConfig,
} from "../../src/core/load-config";

const customSrc = join(import.meta.dir, "../fixtures/custom-src-root");
const lookupNested = join(import.meta.dir, "../fixtures/config-lookup/nested");
const lookupRoot = join(import.meta.dir, "../fixtures/config-lookup");
const invalid = join(import.meta.dir, "../fixtures/config-invalid");
const configTs = join(import.meta.dir, "../fixtures/config-ts");

describe("load-config", () => {
  test("finds config upward from nested dir", () => {
    const found = findConfigPath(lookupNested);
    expect(found).toBe(join(lookupRoot, "dma.config.json"));
  });

  test("loads json config", async () => {
    const loaded = await loadConfig(customSrc);
    expect(loaded?.config.srcRoot).toBe("source");
    expect(loaded?.config.compositionRoots).toEqual(["pages"]);
  });

  test("loads ts config via jiti", async () => {
    const loaded = await loadConfig(configTs);
    expect(loaded?.config.includePackages).toBe(true);
  });

  test("explicit --config path", async () => {
    const loaded = await loadConfig("/tmp", join(customSrc, "dma.config.json"));
    expect(loaded?.config.srcRoot).toBe("source");
  });

  test("rejects unknown keys", () => {
    expect(() => validateDmaConfig({ unknownKey: true })).toThrow(
      DmaEnvironmentError
    );
  });

  test("invalid fixture exits via loadConfig", async () => {
    await expect(loadConfig(invalid)).rejects.toThrow(DmaEnvironmentError);
  });

  test("missing config returns undefined", async () => {
    const loaded = await loadConfig(join(import.meta.dir, "../fixtures/clean"));
    expect(loaded).toBeUndefined();
  });
});
