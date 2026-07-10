import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { discover } from "../../src/core/discover";

const fixture = join(import.meta.dir, "../fixtures/clean");

describe("discover", () => {
  test("finds layers and modules", () => {
    const project = discover(fixture);
    expect(project.layers.features).toBeTruthy();
    expect(
      project.modules.some((m) => m.name === "profile" && m.kind === "file")
    ).toBe(true);
    expect(
      project.modules.some((m) => m.name === "checkout" && m.kind === "dir")
    ).toBe(true);
    expect(
      project.modules.every(
        (m) => m.layer === "features" || m.layer === "services"
      )
    ).toBe(true);
  });

  test("throws when src missing", () => {
    expect(() => discover(import.meta.dir)).toThrow();
  });

  test("discovers vue svelte and astro as stage-0 modules", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-sfc-discover-"));
    mkdirSync(join(root, "src/features"), { recursive: true });
    writeFileSync(
      join(root, "src/features/profile.vue"),
      "<script></script>\n"
    );
    writeFileSync(
      join(root, "src/features/cart.svelte"),
      "<script></script>\n"
    );
    writeFileSync(join(root, "src/features/home.astro"), "---\n---\n");

    const project = discover(root);
    expect(
      project.modules.some(
        (m) => m.name === "profile" && m.kind === "file" && m.stage === 0
      )
    ).toBe(true);
    expect(project.modules.some((m) => m.name === "cart")).toBe(true);
    expect(project.modules.some((m) => m.name === "home")).toBe(true);
    expect(project.sourceFiles.some((f) => f.endsWith("profile.vue"))).toBe(
      true
    );
  });

  test("discovers mdx md mjs cjs source files", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-md-discover-"));
    mkdirSync(join(root, "src/features"), { recursive: true });
    writeFileSync(join(root, "src/features/docs.mdx"), "export const x = 1;\n");
    writeFileSync(join(root, "src/features/notes.md"), "# notes\n");
    writeFileSync(join(root, "src/features/util.mjs"), "export {};\n");
    writeFileSync(
      join(root, "src/features/legacy.cjs"),
      "module.exports={};\n"
    );

    const project = discover(root);
    expect(project.modules.some((m) => m.name === "docs")).toBe(true);
    expect(project.modules.some((m) => m.name === "notes")).toBe(true);
    expect(project.modules.some((m) => m.name === "util")).toBe(true);
    expect(project.modules.some((m) => m.name === "legacy")).toBe(true);
    expect(project.sourceFiles.some((f) => f.endsWith(".mdx"))).toBe(true);
    expect(project.sourceFiles.some((f) => f.endsWith(".mjs"))).toBe(true);
  });

  test("discovers pages and routes as composition roots", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-composition-"));
    mkdirSync(join(root, "src/pages"), { recursive: true });
    mkdirSync(join(root, "src/routes"), { recursive: true });
    mkdirSync(join(root, "src/features"), { recursive: true });
    writeFileSync(join(root, "src/pages/index.tsx"), "export {};\n");
    writeFileSync(join(root, "src/routes/home.tsx"), "export {};\n");
    writeFileSync(join(root, "src/features/profile.tsx"), "export {};\n");

    const project = discover(root);
    expect(
      project.compositionRoots
        .map((p) => basename(p))
        .sort((a, b) => a.localeCompare(b))
    ).toEqual(["pages", "routes"]);
    expect(project.layers.app).toBeTruthy();
    expect(basename(project.layers.app ?? "")).toBe("pages");
    expect(project.sourceFiles.some((f) => f.endsWith("pages/index.tsx"))).toBe(
      true
    );
  });

  test("prefers app among composition roots for layers.app", () => {
    const root = mkdtempSync(join(tmpdir(), "dma-composition-app-"));
    mkdirSync(join(root, "src/app"), { recursive: true });
    mkdirSync(join(root, "src/pages"), { recursive: true });
    writeFileSync(join(root, "src/app/shell.tsx"), "export {};\n");
    writeFileSync(join(root, "src/pages/index.tsx"), "export {};\n");

    const project = discover(root);
    expect(project.compositionRoots).toHaveLength(2);
    expect(basename(project.layers.app ?? "")).toBe("app");
  });
});
