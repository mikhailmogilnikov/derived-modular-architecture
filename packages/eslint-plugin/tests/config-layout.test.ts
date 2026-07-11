import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { Rule } from "eslint";
import { clearLayoutConfigCache } from "../src/load-layout-config";
import { getPathContext } from "../src/settings";

const fixtures = join(import.meta.dir, "fixtures");

afterEach(() => {
  clearLayoutConfigCache();
});

const fakeContext = (settings?: {
  dma?: { compositionRoots?: string[]; srcRoot?: string };
}): Rule.RuleContext =>
  ({
    cwd: process.cwd(),
    settings: settings ?? {},
  }) as Rule.RuleContext;

describe("dma.config layout settings", () => {
  test("reads srcRoot from dma.config.json near the file", () => {
    const page = join(fixtures, "config-layout/source/pages/index.tsx");
    const ctx = getPathContext(fakeContext(), page);
    expect(ctx.srcRoot.endsWith(join("config-layout", "source"))).toBe(true);
    expect(ctx.compositionRootDirnames).toEqual(["pages"]);
  });

  test("settings.dma overrides dma.config", () => {
    const app = join(fixtures, "config-layout-override/src/app/app.tsx");
    const ctx = getPathContext(fakeContext({ dma: { srcRoot: "src" } }), app);
    expect(ctx.srcRoot.endsWith(join("config-layout-override", "src"))).toBe(
      true
    );
  });

  test("without override, config srcRoot source is used", () => {
    const app = join(fixtures, "config-layout-override/src/app/app.tsx");
    const ctx = getPathContext(fakeContext(), app);
    expect(ctx.srcRoot.endsWith("source")).toBe(true);
  });
});
