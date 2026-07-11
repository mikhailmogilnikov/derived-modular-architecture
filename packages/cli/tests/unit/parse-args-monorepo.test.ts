import { describe, expect, test } from "bun:test";
import { parseCliArgs } from "../../src/cli/parse-args";

describe("parseCliArgs monorepo flags", () => {
  test("parses comma-separated --roots", () => {
    const args = parseCliArgs(["check", ".", "--roots", "apps/web,apps/admin"]);
    expect(args.roots).toEqual(["apps/web", "apps/admin"]);
    expect(args.includePackages).toBe(false);
  });

  test("parses repeated --roots", () => {
    const args = parseCliArgs([
      "check",
      ".",
      "--roots",
      "apps/web",
      "--roots",
      "apps/admin",
    ]);
    expect(args.roots).toEqual(["apps/web", "apps/admin"]);
  });

  test("parses --include-packages", () => {
    const args = parseCliArgs(["check", ".", "--include-packages"]);
    expect(args.includePackages).toBe(true);
    expect(args.includePackagesExplicit).toBe(true);
  });

  test("defaults includePackages to false", () => {
    const args = parseCliArgs(["check", "."]);
    expect(args.includePackages).toBe(false);
    expect(args.includePackagesExplicit).toBe(false);
    expect(args.roots).toBeUndefined();
  });

  test("parses --config", () => {
    const args = parseCliArgs(["check", ".", "--config", "dma.config.json"]);
    expect(args.config).toBe("dma.config.json");
  });

  test("rejects unknown flags", () => {
    expect(() => parseCliArgs(["check", ".", "--unknown"])).toThrow();
  });
});
