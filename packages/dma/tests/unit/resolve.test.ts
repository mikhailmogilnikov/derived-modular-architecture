import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseImports } from "../../src/core/parse-imports";
import { resolveImport } from "../../src/core/resolve";
import { loadPathAliases } from "../../src/core/tsconfig-paths";

const fixture = join(import.meta.dir, "../fixtures/clean");

describe("resolve", () => {
  test("resolves @/ alias and relative imports", () => {
    const aliases = loadPathAliases(fixture);
    const appFile = join(fixture, "src/app/app.tsx");
    const specs = parseImports(appFile, readFileSync(appFile, "utf8"));
    expect(specs.some((s) => s.specifier.startsWith("@/"))).toBe(true);
    const resolved = resolveImport(
      appFile,
      "@/features/profile",
      aliases,
      fixture
    );
    expect(resolved?.endsWith("features/profile.tsx")).toBe(true);
  });

  test("parseImports treats import type as type-only", () => {
    const specs = parseImports(
      "x.ts",
      `import type { Foo } from "./foo";\nimport { bar } from "./bar";`
    );
    expect(specs.find((s) => s.specifier === "./foo")?.isTypeOnly).toBe(true);
    expect(specs.find((s) => s.specifier === "./bar")?.isTypeOnly).toBe(false);
  });
});
