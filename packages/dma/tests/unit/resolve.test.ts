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

  test("parseImports extracts script imports from vue/svelte/astro", () => {
    const vue = parseImports(
      "Widget.vue",
      `<script setup lang="ts">
import type { Foo } from "./foo";
import { bar } from "./bar";
</script>
<template><div /></template>
`
    );
    expect(vue.find((s) => s.specifier === "./foo")?.isTypeOnly).toBe(true);
    expect(vue.find((s) => s.specifier === "./bar")?.isTypeOnly).toBe(false);

    const svelte = parseImports(
      "Widget.svelte",
      `<script lang="ts">
import { cart } from "../services/cart";
</script>
`
    );
    expect(svelte.some((s) => s.specifier === "../services/cart")).toBe(true);

    const astro = parseImports(
      "page.astro",
      `---
import Layout from "../layouts/Layout.astro";
import { Profile } from "@/features/profile";
---
<Layout />
`
    );
    expect(astro.some((s) => s.specifier === "../layouts/Layout.astro")).toBe(
      true
    );
    expect(astro.some((s) => s.specifier === "@/features/profile")).toBe(true);
  });

  test("resolves to .vue .svelte .astro extensions", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-sfc-resolve-"));
    const fromFile = join(root, "app.ts");
    writeFileSync(fromFile, 'import "./Widget.vue";\n');
    const vueFile = join(root, "Widget.vue");
    writeFileSync(vueFile, "<script></script>\n");
    const svelteFile = join(root, "Card.svelte");
    writeFileSync(svelteFile, "<script></script>\n");
    const astroFile = join(root, "Page.astro");
    writeFileSync(astroFile, "---\n---\n");

    expect(resolveImport(fromFile, "./Widget", [], root)).toBe(vueFile);
    expect(resolveImport(fromFile, "./Card", [], root)).toBe(svelteFile);
    expect(resolveImport(fromFile, "./Page", [], root)).toBe(astroFile);
  });

  test("parseImports captures dynamic import and require", () => {
    const specs = parseImports(
      "x.ts",
      `
const a = import("./lazy");
const b = require("./cjs-mod");
export { x } from "./reexport";
`
    );
    expect(specs.some((s) => s.specifier === "./lazy")).toBe(true);
    expect(specs.some((s) => s.specifier === "./cjs-mod")).toBe(true);
    expect(specs.some((s) => s.specifier === "./reexport")).toBe(true);
  });

  test("parseImports extracts imports from md and mdx", () => {
    const md = parseImports(
      "guide.md",
      `---
title: Guide
---

import Callout from "./Callout.mdx";

# Hello

Some text.
`
    );
    expect(md.some((s) => s.specifier === "./Callout.mdx")).toBe(true);

    const mdx = parseImports(
      "page.mdx",
      `import { Chart } from "./Chart";
import Layout from "../Layout.astro";

export const meta = { title: "Page" };

# Title
`
    );
    expect(mdx.some((s) => s.specifier === "./Chart")).toBe(true);
    expect(mdx.some((s) => s.specifier === "../Layout.astro")).toBe(true);
  });

  test("resolves mjs cjs md mdx extensions", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-ext-resolve-"));
    const fromFile = join(root, "app.ts");
    writeFileSync(fromFile, "export {};\n");
    const mjsFile = join(root, "util.mjs");
    const cjsFile = join(root, "legacy.cjs");
    const mdFile = join(root, "doc.md");
    const mdxFile = join(root, "page.mdx");
    writeFileSync(mjsFile, "export {};\n");
    writeFileSync(cjsFile, "module.exports = {};\n");
    writeFileSync(mdFile, "# hi\n");
    writeFileSync(mdxFile, "export const x = 1;\n");

    expect(resolveImport(fromFile, "./util", [], root)).toBe(mjsFile);
    expect(resolveImport(fromFile, "./legacy", [], root)).toBe(cjsFile);
    expect(resolveImport(fromFile, "./doc", [], root)).toBe(mdFile);
    expect(resolveImport(fromFile, "./page", [], root)).toBe(mdxFile);
  });
});
