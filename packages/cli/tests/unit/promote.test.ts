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
import { parseCliArgs } from "../../src/cli/parse-args";
import { applyPromote } from "../../src/cli/promote-apply";
import {
  buildPromotePlan,
  collectErrorFingerprints,
  errorFingerprint,
  formatPromotePlan,
} from "../../src/cli/promote-plan";
import {
  canonicalizeModuleRefs,
  isPathInside,
  normalizeModuleName,
  replaceFeaturesSegment,
  replaceSpecifierAt,
  rewriteSpecifierForPromote,
} from "../../src/cli/promote-rewrite";
import { runCli } from "../../src/cli/run";
import { DEFAULT_DMA_CONFIG } from "../../src/core/config-types";
import { DmaEnvironmentError } from "../../src/core/errors";
import type { Diagnostic } from "../../src/core/types";

const fixturesRoot = join(import.meta.dir, "../fixtures");
const options = {
  compositionRoots: DEFAULT_DMA_CONFIG.compositionRoots,
  includePackages: false,
  srcRoot: DEFAULT_DMA_CONFIG.srcRoot,
};

const REJECTS_FLAGS_RE = /does not accept/;
const REQUIRES_MODULE_RE = /requires a module/;
const TARGET_GONE_RE = /already exists|Module not found/;
const STAGE0_RE = /stage-0/;
const PUBLIC_RE = /no public/;
const POST_CHECK_FAIL_RE = /new errors|inbound/i;

describe("parseCliArgs promote", () => {
  test("parses module, path, and --apply", () => {
    const args = parseCliArgs([
      "promote",
      "features/promo",
      "/tmp/app",
      "--apply",
    ]);
    expect(args.command).toBe("promote");
    expect(args.module).toBe("features/promo");
    expect(args.path).toBe("/tmp/app");
    expect(args.apply).toBe(true);
  });

  test("dry-run by default", () => {
    const args = parseCliArgs(["promote", "promo"]);
    expect(args.apply).toBe(false);
    expect(args.path).toBe(process.cwd());
  });

  test("rejects analyze flags", () => {
    expect(() =>
      parseCliArgs(["promote", "promo", "--format", "json"])
    ).toThrow(REJECTS_FLAGS_RE);
  });

  test("requires module name", () => {
    expect(() => parseCliArgs(["promote"])).toThrow(REQUIRES_MODULE_RE);
  });
});

describe("promote-rewrite", () => {
  test("normalizeModuleName accepts variants", () => {
    expect(normalizeModuleName("promo")).toBe("promo");
    expect(normalizeModuleName("features/promo")).toBe("promo");
    expect(normalizeModuleName("src/features/promo")).toBe("promo");
  });

  test("normalizeModuleName rejects nested paths", () => {
    expect(() => normalizeModuleName("features/a/b")).toThrow(
      DmaEnvironmentError
    );
  });

  test("isPathInside rejects prefix siblings", () => {
    expect(
      isPathInside("/src/features/promo-extra/x.ts", "/src/features/promo")
    ).toBe(false);
    expect(
      isPathInside("/src/features/promo/public/x.ts", "/src/features/promo")
    ).toBe(true);
  });

  test("replaceFeaturesSegment respects path boundaries", () => {
    expect(replaceFeaturesSegment("@/features/promo/public/x", "promo")).toBe(
      "@/services/promo/public/x"
    );
    expect(replaceFeaturesSegment("@/features/promo-extra/x", "promo")).toBe(
      null
    );
    expect(replaceFeaturesSegment("@/features/cartoon/x", "cart")).toBe(null);
    expect(replaceFeaturesSegment("@/features/cart/x", "cart")).toBe(
      "@/services/cart/x"
    );
  });

  test("canonicalizeModuleRefs maps features and services for fingerprints", () => {
    expect(
      canonicalizeModuleRefs(
        'Inbound to feature "promo" at features/promo',
        "promo"
      )
    ).toBe(
      canonicalizeModuleRefs(
        'Inbound to feature "promo" at services/promo',
        "promo"
      )
    );
    expect(canonicalizeModuleRefs("features/promo-extra", "promo")).toBe(
      "features/promo-extra"
    );
  });

  test("rewriteSpecifierForPromote rewrites @/ paths", () => {
    expect(
      rewriteSpecifierForPromote(
        "@/features/promo/public/x",
        "promo",
        "/p/src/services/cart/public/cart.ts",
        "/p/src/features/promo/public/x.ts",
        "/p/src/features/promo",
        "/p/src/services/promo"
      )
    ).toBe("@/services/promo/public/x");
  });

  test("replaceSpecifierAt swaps quoted specifier", () => {
    const source = `import { x } from "@/features/promo/public/x";\n`;
    const out = replaceSpecifierAt(
      source,
      1,
      20,
      "@/features/promo/public/x",
      "@/services/promo/public/x"
    );
    expect(out).toContain("@/services/promo/public/x");
    expect(out).not.toContain("@/features/promo/public/x");
  });

  test("replaceSpecifierAt supports single quotes", () => {
    const source = `import { x } from '@/features/promo/public/x';\n`;
    const out = replaceSpecifierAt(
      source,
      1,
      20,
      "@/features/promo/public/x",
      "@/services/promo/public/x"
    );
    expect(out).toContain("'@/services/promo/public/x'");
  });

  test("rewriteSpecifierForPromote recomputes relatives without features/ segment", () => {
    expect(
      rewriteSpecifierForPromote(
        "../../promo/public/x",
        "promo",
        "/p/src/features/peer/public/p.ts",
        "/p/src/features/promo/public/x.ts",
        "/p/src/features/promo",
        "/p/src/services/promo"
      )
    ).toBe("../../../services/promo/public/x");
  });
});

describe("promote fingerprints", () => {
  test("maps old module file paths to new root", () => {
    const plan = {
      moduleName: "promo",
      newRoot: "/app/src/services/promo",
      oldRoot: "/app/src/features/promo",
    };
    const before: Diagnostic = {
      file: "/app/src/features/promo/public/x.ts",
      message: "x in features/promo",
      ruleId: "demo",
      severity: "error",
    };
    const after: Diagnostic = {
      file: "/app/src/services/promo/public/x.ts",
      message: "x in services/promo",
      ruleId: "demo",
      severity: "error",
    };
    expect(errorFingerprint(before, plan)).toBe(errorFingerprint(after, plan));
    const set = collectErrorFingerprints([before], plan);
    expect(set.has(errorFingerprint(after, plan))).toBe(true);
  });
});

describe("promote integration", () => {
  const copyFixture = (): string => {
    const dir = mkdtempSync(join(tmpdir(), "dma-promote-"));
    cpSync(join(fixturesRoot, "inbound-feature"), dir, { recursive: true });
    return dir;
  };

  test("dry-run does not move files", () => {
    const dir = copyFixture();
    try {
      const plan = buildPromotePlan(dir, "promo", options);
      expect(formatPromotePlan(plan, false)).toContain("dry-run");
      expect(existsSync(join(dir, "src/features/promo"))).toBe(true);
      expect(existsSync(join(dir, "src/services/promo"))).toBe(false);
      expect(plan.rewrites.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("apply moves module, rewrites imports, clears feature-has-inbound", async () => {
    const dir = copyFixture();
    try {
      const code = await runCli(["promote", "promo", dir, "--apply"]);
      expect(code).toBe(0);
      expect(existsSync(join(dir, "src/features/promo"))).toBe(false);
      expect(existsSync(join(dir, "src/services/promo/public/x.ts"))).toBe(
        true
      );
      const cart = readFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        "utf8"
      );
      expect(cart).toContain("@/services/promo/public/x");
      expect(cart).not.toContain("@/features/promo");

      const checkCode = await runCli(["check", dir]);
      expect(checkCode).toBe(1);
      const { analyze } = await import("../../src/core/analyze");
      const result = analyze(dir, "check");
      expect(
        result.diagnostics.some((d) => d.ruleId === "feature-has-inbound")
      ).toBe(false);
      expect(
        result.diagnostics.some((d) => d.ruleId === "layer-direction")
      ).toBe(false);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("does not rewrite prefix-sibling modules", () => {
    const dir = copyFixture();
    try {
      mkdirSync(join(dir, "src/features/promo-extra/public"), {
        recursive: true,
      });
      writeFileSync(
        join(dir, "src/features/promo-extra/public/y.ts"),
        "export const promoExtraY = 1;\n"
      );
      writeFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        `import { promoX } from "@/features/promo/public/x";\nimport { promoExtraY } from "@/features/promo-extra/public/y";\nexport const cart = [promoX, promoExtraY];\n`
      );

      const plan = buildPromotePlan(dir, "promo", options);
      expect(
        plan.rewrites.every((r) => !r.oldSpecifier.includes("promo-extra"))
      ).toBe(true);
      expect(
        plan.rewrites.some((r) => r.oldSpecifier.includes("@/features/promo/"))
      ).toBe(true);

      applyPromote(plan, options);
      const cart = readFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        "utf8"
      );
      expect(cart).toContain("@/services/promo/public/x");
      expect(cart).toContain("@/features/promo-extra/public/y");
      expect(
        existsSync(join(dir, "src/features/promo-extra/public/y.ts"))
      ).toBe(true);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rewrites external relative imports into the module", () => {
    const dir = copyFixture();
    try {
      writeFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        `import { promoX } from "../../../features/promo/public/x";\nexport const cart = promoX;\n`
      );
      const plan = buildPromotePlan(dir, "promo", options);
      expect(
        plan.rewrites.some((r) => r.oldSpecifier.includes("../features/promo"))
      ).toBe(true);
      applyPromote(plan, options);
      const cart = readFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        "utf8"
      );
      expect(cart).toContain("../../../services/promo/public/x");
      expect(cart).not.toContain("features/promo");
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rollback restores tree when a rewrite fails after move", () => {
    const dir = copyFixture();
    try {
      const plan = buildPromotePlan(dir, "promo", options);
      const cartPath = join(dir, "src/services/cart/public/cart.ts");
      const cartBefore = readFileSync(cartPath, "utf8");
      const promoBefore = readFileSync(
        join(dir, "src/features/promo/public/x.ts"),
        "utf8"
      );
      expect(plan.rewrites.length).toBeGreaterThan(0);
      plan.rewrites[0].oldSpecifier = "__mismatch__";

      expect(() => applyPromote(plan, options)).toThrow(DmaEnvironmentError);
      expect(existsSync(join(dir, "src/features/promo/public/x.ts"))).toBe(
        true
      );
      expect(existsSync(join(dir, "src/services/promo"))).toBe(false);
      expect(readFileSync(cartPath, "utf8")).toBe(cartBefore);
      expect(
        readFileSync(join(dir, "src/features/promo/public/x.ts"), "utf8")
      ).toBe(promoBefore);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("deep nesting: keeps internal relatives, rewrites external aliases", () => {
    const dir = copyFixture();
    try {
      const nestedUi = join(dir, "src/features/promo/ui/forms/fields");
      mkdirSync(nestedUi, { recursive: true });
      writeFileSync(
        join(nestedUi, "input.tsx"),
        "export const Input = () => null;\n"
      );
      writeFileSync(
        join(dir, "src/features/promo/ui/forms/form.tsx"),
        `import { Input } from "./fields/input";\nexport const Form = Input;\n`
      );
      writeFileSync(
        join(dir, "src/features/promo/public/x.ts"),
        `import { Form } from "../ui/forms/form";\nexport const promoX = Form;\n`
      );

      const plan = buildPromotePlan(dir, "promo", options);
      expect(plan.rewrites.every((r) => !r.oldSpecifier.startsWith("./"))).toBe(
        true
      );
      expect(
        plan.rewrites.some((r) => r.oldSpecifier.includes("@/features/promo"))
      ).toBe(true);

      applyPromote(plan, options);
      expect(
        existsSync(join(dir, "src/services/promo/ui/forms/fields/input.tsx"))
      ).toBe(true);
      const form = readFileSync(
        join(dir, "src/services/promo/ui/forms/form.tsx"),
        "utf8"
      );
      expect(form).toContain('from "./fields/input"');
      const pub = readFileSync(
        join(dir, "src/services/promo/public/x.ts"),
        "utf8"
      );
      expect(pub).toContain('from "../ui/forms/form"');
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("preflight rejects existing services target", () => {
    const dir = copyFixture();
    try {
      const plan = buildPromotePlan(dir, "promo", options);
      applyPromote(plan, options);
      expect(() => buildPromotePlan(dir, "promo", options)).toThrow(
        TARGET_GONE_RE
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("preflight rejects stage-0 file module", () => {
    const dir = copyFixture();
    try {
      cpSync(
        join(fixturesRoot, "stage-growth-0/src/features/checkout.tsx"),
        join(dir, "src/features/checkout.tsx")
      );
      expect(() => buildPromotePlan(dir, "checkout", options)).toThrow(
        STAGE0_RE
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("preflight rejects public as a file", () => {
    const dir = copyFixture();
    try {
      rmSync(join(dir, "src/features/promo/public"), {
        force: true,
        recursive: true,
      });
      writeFileSync(join(dir, "src/features/promo/public"), "not a dir\n");
      expect(() => buildPromotePlan(dir, "promo", options)).toThrow(PUBLIC_RE);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rewrites intra-module @/features alias; keeps relatives", () => {
    const dir = copyFixture();
    try {
      mkdirSync(join(dir, "src/features/promo/ui"), { recursive: true });
      writeFileSync(
        join(dir, "src/features/promo/ui/widget.ts"),
        `import { promoX } from "@/features/promo/public/x";\nexport const w = promoX;\n`
      );
      writeFileSync(
        join(dir, "src/features/promo/public/x.ts"),
        `import { w } from "../ui/widget";\nexport const promoX = w;\n`
      );

      const plan = buildPromotePlan(dir, "promo", options);
      expect(
        plan.rewrites.some(
          (r) =>
            r.file.endsWith("widget.ts") &&
            r.oldSpecifier === "@/features/promo/public/x"
        )
      ).toBe(true);
      expect(
        plan.rewrites.every((r) => r.oldSpecifier !== "../ui/widget")
      ).toBe(true);

      applyPromote(plan, options);
      const widget = readFileSync(
        join(dir, "src/services/promo/ui/widget.ts"),
        "utf8"
      );
      expect(widget).toContain("@/services/promo/public/x");
      const pub = readFileSync(
        join(dir, "src/services/promo/public/x.ts"),
        "utf8"
      );
      expect(pub).toContain('from "../ui/widget"');
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rewrites multiple import forms in one file", () => {
    const dir = copyFixture();
    try {
      writeFileSync(
        join(dir, "src/features/promo/public/y.ts"),
        "export const promoY = 2;\n"
      );
      writeFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        [
          `import { promoX } from "@/features/promo/public/x";`,
          `export { promoY } from "@/features/promo/public/y";`,
          `const lazy = import("@/features/promo/public/x");`,
          `const cjs = require("@/features/promo/public/y");`,
          "export const cart = { promoX, lazy, cjs };",
          "",
        ].join("\n")
      );

      const plan = buildPromotePlan(dir, "promo", options);
      expect(plan.rewrites.length).toBeGreaterThanOrEqual(4);
      applyPromote(plan, options);
      const cart = readFileSync(
        join(dir, "src/services/cart/public/cart.ts"),
        "utf8"
      );
      expect(cart).not.toContain("@/features/promo");
      expect(cart).toContain("@/services/promo/public/x");
      expect(cart).toContain("@/services/promo/public/y");
      expect(cart).toContain('import("@/services/promo/public/x")');
      expect(cart).toContain('require("@/services/promo/public/y")');
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rewrites external relative without features/<name> substring", () => {
    const dir = copyFixture();
    try {
      mkdirSync(join(dir, "src/features/peer/public"), { recursive: true });
      writeFileSync(
        join(dir, "src/features/peer/public/p.ts"),
        `import { promoX } from "../../promo/public/x";\nexport const peer = promoX;\n`
      );

      const plan = buildPromotePlan(dir, "promo", options);
      const peerRewrite = plan.rewrites.find((r) =>
        r.file.endsWith(`${join("peer", "public", "p.ts")}`)
      );
      expect(peerRewrite?.oldSpecifier).toBe("../../promo/public/x");
      expect(peerRewrite?.newSpecifier).toBe(
        "../../../services/promo/public/x"
      );

      applyPromote(plan, options);
      const peer = readFileSync(
        join(dir, "src/features/peer/public/p.ts"),
        "utf8"
      );
      expect(peer).toContain("../../../services/promo/public/x");
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("rollback when post-check finds new errors", () => {
    const dir = copyFixture();
    try {
      mkdirSync(join(dir, "src/features/peer/public"), { recursive: true });
      writeFileSync(
        join(dir, "src/features/peer/public/p.ts"),
        "export const peerP = 1;\n"
      );

      const plan = buildPromotePlan(dir, "promo", options);
      const cartPath = join(dir, "src/services/cart/public/cart.ts");
      const cartBefore = readFileSync(cartPath, "utf8");
      const promoBefore = readFileSync(
        join(dir, "src/features/promo/public/x.ts"),
        "utf8"
      );
      expect(plan.rewrites.length).toBeGreaterThan(0);
      plan.rewrites[0].newSpecifier = "@/features/peer/public/p";

      expect(() => applyPromote(plan, options)).toThrow(POST_CHECK_FAIL_RE);
      expect(existsSync(join(dir, "src/features/promo/public/x.ts"))).toBe(
        true
      );
      expect(existsSync(join(dir, "src/services/promo"))).toBe(false);
      expect(readFileSync(cartPath, "utf8")).toBe(cartBefore);
      expect(
        readFileSync(join(dir, "src/features/promo/public/x.ts"), "utf8")
      ).toBe(promoBefore);
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("runCli returns 2 on preflight failures", async () => {
    const dir = copyFixture();
    try {
      const missing = await runCli([
        "promote",
        "does-not-exist",
        dir,
        "--apply",
      ]);
      expect(missing).toBe(2);

      cpSync(
        join(fixturesRoot, "stage-growth-0/src/features/checkout.tsx"),
        join(dir, "src/features/checkout.tsx")
      );
      const stage0 = await runCli(["promote", "checkout", dir, "--apply"]);
      expect(stage0).toBe(2);

      mkdirSync(join(dir, "src/services/promo"), { recursive: true });
      const exists = await runCli(["promote", "promo", dir, "--apply"]);
      expect(exists).toBe(2);
      expect(existsSync(join(dir, "src/features/promo/public/x.ts"))).toBe(
        true
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("explicit --config path with custom srcRoot", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-promote-cfg-"));
    try {
      mkdirSync(join(dir, "source/features/promo/public"), { recursive: true });
      mkdirSync(join(dir, "source/services/cart/public"), { recursive: true });
      mkdirSync(join(dir, "configs"), { recursive: true });
      writeFileSync(
        join(dir, "source/features/promo/public/x.ts"),
        "export const promoX = true;\n"
      );
      writeFileSync(
        join(dir, "source/services/cart/public/cart.ts"),
        `import { promoX } from "@/features/promo/public/x";\nexport const cart = promoX;\n`
      );
      const configPath = join(dir, "configs/dma.config.json");
      writeFileSync(
        configPath,
        `${JSON.stringify({ srcRoot: "source" }, null, 2)}\n`
      );
      writeFileSync(
        join(dir, "tsconfig.json"),
        `${JSON.stringify(
          { compilerOptions: { paths: { "@/*": ["./source/*"] } } },
          null,
          2
        )}\n`
      );

      const code = await runCli([
        "promote",
        "promo",
        dir,
        "--apply",
        "--config",
        configPath,
      ]);
      expect(code).toBe(0);
      expect(existsSync(join(dir, "source/services/promo/public/x.ts"))).toBe(
        true
      );
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  test("custom srcRoot via dma.config.json", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dma-promote-src-"));
    try {
      mkdirSync(join(dir, "source/features/promo/public"), { recursive: true });
      mkdirSync(join(dir, "source/services/cart/public"), { recursive: true });
      writeFileSync(
        join(dir, "source/features/promo/public/x.ts"),
        "export const promoX = true;\n"
      );
      writeFileSync(
        join(dir, "source/services/cart/public/cart.ts"),
        `import { promoX } from "@/features/promo/public/x";\nexport const cart = promoX;\n`
      );
      writeFileSync(
        join(dir, "dma.config.json"),
        `${JSON.stringify({ srcRoot: "source" }, null, 2)}\n`
      );
      writeFileSync(
        join(dir, "tsconfig.json"),
        `${JSON.stringify(
          { compilerOptions: { paths: { "@/*": ["./source/*"] } } },
          null,
          2
        )}\n`
      );

      const code = await runCli(["promote", "promo", dir, "--apply"]);
      expect(code).toBe(0);
      expect(existsSync(join(dir, "source/features/promo"))).toBe(false);
      expect(existsSync(join(dir, "source/services/promo/public/x.ts"))).toBe(
        true
      );
      const cart = readFileSync(
        join(dir, "source/services/cart/public/cart.ts"),
        "utf8"
      );
      expect(cart).toContain("@/services/promo/public/x");
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });
});
