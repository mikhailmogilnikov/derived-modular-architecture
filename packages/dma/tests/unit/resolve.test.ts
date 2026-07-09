import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

  test("resolves directory specifier to index.ts", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-resolve-"));
    const fromFile = join(root, "app.ts");
    const dir = join(root, "mod");
    mkdirSync(dir);
    const indexFile = join(dir, "index.ts");
    writeFileSync(fromFile, 'import "./mod";\n');
    writeFileSync(indexFile, "export {};\n");

    const resolved = resolveImport(fromFile, "./mod", [], root);
    expect(resolved).toBe(indexFile);
  });

  test("parseImports treats import type as type-only", () => {
    const specs = parseImports(
      "x.ts",
      `import type { Foo } from "./foo";\nimport { bar } from "./bar";`
    );
    expect(specs.find((s) => s.specifier === "./foo")?.isTypeOnly).toBe(true);
    expect(specs.find((s) => s.specifier === "./bar")?.isTypeOnly).toBe(false);
  });

  test("loadPathAliases accepts tsconfig with comments", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-tsconfig-"));
    writeFileSync(
      join(root, "tsconfig.json"),
      `{
  // path aliases
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"], // app root
    },
  },
}
`
    );
    const aliases = loadPathAliases(root);
    expect(aliases).toHaveLength(1);
    expect(aliases[0]?.prefix).toBe("@");
    expect(aliases[0]?.baseDir).toBe(join(root, "src"));
  });
});
