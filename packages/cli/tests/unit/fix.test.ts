import { describe, expect, test } from "bun:test";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyFixPlan } from "../../src/cli/fix-apply";
import {
  buildFixPlan,
  findSafePublicTarget,
  formatFixPlan,
  rewriteDeepSpecifier,
} from "../../src/cli/fix-plan";
import { parseCliArgs } from "../../src/cli/parse-args";
import { replacePathInfix } from "../../src/cli/promote-rewrite";
import { runCli } from "../../src/cli/run";
import { analyze } from "../../src/core/analyze";
import type { ModuleRef } from "../../src/core/types";

const fixturesRoot = join(import.meta.dir, "../fixtures");

const BOTH_FLAGS_RE = /either --suggest or --fix/;
const PROMOTE_FLAGS_RE = /does not accept/;
const ROLLBACK_RE = /rolled back/;

describe("parseCliArgs fix/suggest", () => {
  test("parses --suggest and --fix on check/doctor", () => {
    expect(parseCliArgs(["check", ".", "--suggest"]).suggest).toBe(true);
    expect(parseCliArgs(["check", ".", "--fix"]).fix).toBe(true);
    expect(parseCliArgs(["doctor", ".", "--fix"]).fix).toBe(true);
  });

  test("rejects both flags", () => {
    expect(() => parseCliArgs(["check", ".", "--suggest", "--fix"])).toThrow(
      BOTH_FLAGS_RE
    );
  });

  test("rejects on promote", () => {
    expect(() => parseCliArgs(["promote", "promo", "--fix"])).toThrow(
      PROMOTE_FLAGS_RE
    );
  });
});

describe("rewriteDeepSpecifier / replacePathInfix", () => {
  const mod = {
    id: "services/cart",
    kind: "dir",
    layer: "services",
    name: "cart",
    rootPath: "/app/src/services/cart",
    stage: 1,
  } as const satisfies ModuleRef;

  test("does not substring-replace short deepRel inside other segments", () => {
    expect(replacePathInfix("@/services/audio/x", "a", "public/a")).toBe(null);
    expect(
      rewriteDeepSpecifier(
        "@/services/audio/x",
        mod,
        "/app/src/services/cart/a.ts",
        "/app/src/services/cart/public/a.ts"
      )
    ).toBe(null);
  });

  test("rewrites path-bounded deepRel", () => {
    expect(
      rewriteDeepSpecifier(
        "@/services/cart/cart.store",
        mod,
        "/app/src/services/cart/cart.store.ts",
        "/app/src/services/cart/public/cart.store.ts"
      )
    ).toBe("@/services/cart/public/cart.store");
  });

  test("findSafePublicTarget requires mirrored public path only", () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-mirror-"));
    try {
      const root = join(dir, "cart");
      mkdirSync(join(root, "ui"), { recursive: true });
      mkdirSync(join(root, "public"), { recursive: true });
      writeFileSync(join(root, "ui/Button.tsx"), "export const B = 1;\n");
      writeFileSync(join(root, "public/Button.tsx"), "export const B = 2;\n");
      const localMod: ModuleRef = { ...mod, rootPath: root };
      expect(
        findSafePublicTarget(localMod, join(root, "ui/Button.tsx"))
      ).toBeNull();
      mkdirSync(join(root, "public/ui"), { recursive: true });
      writeFileSync(
        join(root, "public/ui/Button.tsx"),
        "export const B = 3;\n"
      );
      expect(findSafePublicTarget(localMod, join(root, "ui/Button.tsx"))).toBe(
        join(root, "public/ui/Button.tsx")
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});

describe("check --suggest/--fix", () => {
  test("suggests and applies no-barrel importer rewrite", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-barrel-"));
    try {
      cpSync(join(fixturesRoot, "barrel"), dir, { recursive: true });
      mkdirSync(join(dir, "src/app"), { recursive: true });
      writeFileSync(
        join(dir, "src/app/app.tsx"),
        `import { widget } from "@/features/widget";\nexport const App = widget;\n`
      );

      const plan = buildFixPlan(dir, "check");
      expect(formatFixPlan(plan, false)).toContain("--suggest");
      expect(
        plan.actions.some(
          (a) =>
            a.kind === "rewrite-specifier" &&
            a.ruleId === "no-barrel" &&
            a.newSpecifier === "@/features/widget/public/widget"
        )
      ).toBe(true);

      const code = await runCli(["check", dir, "--fix"]);
      expect(code).toBe(1);
      const app = readFileSync(join(dir, "src/app/app.tsx"), "utf8");
      expect(app).toContain("@/features/widget/public/widget");
      expect(app).not.toContain('from "@/features/widget"');
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("suggests and applies public-api rewrite when mirrored public exists", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-public-"));
    try {
      cpSync(join(fixturesRoot, "deep-import"), dir, { recursive: true });
      mkdirSync(join(dir, "src/services/cart/public"), { recursive: true });
      writeFileSync(
        join(dir, "src/services/cart/public/cart.store.ts"),
        `export { cartStore } from "../cart.store";\n`
      );

      const before = analyze(dir, "check");
      expect(before.diagnostics.some((d) => d.ruleId === "public-api")).toBe(
        true
      );

      const suggest = await runCli(["check", dir, "--suggest"]);
      expect(suggest).toBe(1);

      const code = await runCli(["check", dir, "--fix"]);
      const a = readFileSync(join(dir, "src/features/a/public/a.ts"), "utf8");
      expect(a).toContain("@/services/cart/public/cart.store");
      const after = analyze(dir, "check");
      expect(after.diagnostics.some((d) => d.ruleId === "public-api")).toBe(
        false
      );
      expect(code).toBe(0);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("does not invent public files for deep imports", () => {
    const plan = buildFixPlan(join(fixturesRoot, "deep-import"), "check");
    expect(plan.actions.filter((a) => a.ruleId === "public-api")).toHaveLength(
      0
    );
  });

  test("does not use basename-only public twin", () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-basename-"));
    try {
      cpSync(join(fixturesRoot, "deep-import"), dir, { recursive: true });
      mkdirSync(join(dir, "src/services/cart/model"), { recursive: true });
      mkdirSync(join(dir, "src/services/cart/public"), { recursive: true });
      writeFileSync(
        join(dir, "src/services/cart/model/cart.store.ts"),
        "export const cartStore = {};\n"
      );
      writeFileSync(
        join(dir, "src/services/cart/public/cart.store.ts"),
        "export const cartStore = {};\n"
      );
      writeFileSync(
        join(dir, "src/features/a/public/a.ts"),
        `import { cartStore } from "@/services/cart/model/cart.store";\nexport const a = cartStore;\n`
      );
      // basename twin exists at public/cart.store but mirrored would be public/model/cart.store
      const plan = buildFixPlan(dir, "check");
      expect(
        plan.actions.filter((a) => a.ruleId === "public-api")
      ).toHaveLength(0);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rolls back rewrites when apply fails mid-flight", () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-rollback-"));
    try {
      cpSync(join(fixturesRoot, "barrel"), dir, { recursive: true });
      mkdirSync(join(dir, "src/app"), { recursive: true });
      const appPath = join(dir, "src/app/app.tsx");
      writeFileSync(
        appPath,
        `import { widget } from "@/features/widget";\nexport const App = widget;\n`
      );
      const before = readFileSync(appPath, "utf8");
      const plan = buildFixPlan(dir, "check");
      expect(plan.actions.length).toBeGreaterThan(0);
      const [action] = plan.actions;
      if (action?.kind !== "rewrite-specifier") {
        throw new Error("expected rewrite-specifier action");
      }
      action.oldSpecifier = "__mismatch__";
      expect(() => applyFixPlan(plan)).toThrow(ROLLBACK_RE);
      expect(readFileSync(appPath, "utf8")).toBe(before);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});

describe("doctor --suggest/--fix orphan-public", () => {
  test("deletes orphan public file with no importers", () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-orphan-"));
    try {
      cpSync(join(fixturesRoot, "shared-candidate"), dir, { recursive: true });
      const dead = join(dir, "src/services/format/public/dead.ts");
      expect(existsSync(dead)).toBe(true);

      const plan = buildFixPlan(dir, "doctor");
      expect(
        plan.actions.some(
          (a) => a.kind === "delete-file" && a.file.endsWith("dead.ts")
        )
      ).toBe(true);

      applyFixPlan(plan);
      expect(existsSync(dead)).toBe(false);

      const after = analyze(dir, "doctor");
      expect(
        after.diagnostics.some(
          (d) => d.ruleId === "orphan-public" && d.file?.endsWith("dead.ts")
        )
      ).toBe(false);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("refuses to delete orphan that is imported internally", () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-fix-orphan-int-"));
    try {
      cpSync(join(fixturesRoot, "shared-candidate"), dir, { recursive: true });
      writeFileSync(
        join(dir, "src/services/format/format-date.ts"),
        `import { dead } from "./public/dead";\nexport const formatDate = () => dead;\n`
      );
      const dead = join(dir, "src/services/format/public/dead.ts");
      const plan = buildFixPlan(dir, "doctor");
      expect(
        plan.actions.some(
          (a) => a.kind === "delete-file" && a.file.endsWith("dead.ts")
        )
      ).toBe(false);
      expect(
        plan.skipped.some((s) => s.includes("internally") && s.includes("dead"))
      ).toBe(true);
      expect(existsSync(dead)).toBe(true);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});
