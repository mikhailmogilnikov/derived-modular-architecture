# DMA linter adapters Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@derived-modular/boundaries` + `@derived-modular/eslint-plugin` for file-scoped DMA rules (`layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`), wire CLI path heuristics to boundaries, keep full graph audit in `@derived-modular/cli`.

**Architecture:** Pure path classifier package shared by ESLint rules and CLI; ESLint plugin never calls `analyze()`; graph rules stay CLI-only.

**Tech Stack:** Bun workspaces, TypeScript, `eslint` >= 9 (flat config + RuleTester), bun:test. No Biome/oxlint packages in this plan (roadmap only in docs).

**Spec:** `docs/superpowers/specs/2026-07-10-dma-linter-adapters-design.md`

## Global Constraints

- Same `ruleId` strings as CLI for the four native rules.
- Composition roots default: `app`, `pages`, `routes` under `srcRoot` → semantic layer `app`.
- Unresolved / external imports: ignore in ESLint rules.
- Do not implement `no-cycle`, `feature-has-inbound`, `service-no-inbound`, or doctor in the plugin.
- `@derived-modular/boundaries` must not depend on ESLint or TypeScript compiler API.
- Core CLI must keep existing tests green after refactor.
- Package manager: bun. Run `bun x ultracite fix` when convenient after edits.
- Root workspaces already include `packages/*`.
- `docs/` is gitignored — force-add docs under `docs/superpowers/` when committing plans/specs.

## File map

```text
packages/
├── boundaries/                 # @derived-modular/boundaries
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── constants.ts        # DEFAULT_COMPOSITION_ROOT_DIRNAMES, LAYER_RANK
│   │   ├── path-utils.ts       # isUnderDir, rel segments
│   │   └── classify-path.ts    # layerOf, moduleOf, isPublicTarget, isBarrelFilename
│   └── tests/
│       └── classify-path.test.ts
├── eslint-plugin/              # @derived-modular/eslint-plugin
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── src/
│   │   ├── index.ts            # plugin + configs.recommended
│   │   ├── settings.ts         # read srcRoot / compositionRoots
│   │   ├── resolve-import.ts   # ESLint resolver helper
│   │   └── rules/
│   │       ├── layer-direction.ts
│   │       ├── feature-to-feature.ts
│   │       ├── public-api.ts
│   │       └── no-barrel.ts
│   └── tests/
│       ├── layer-direction.test.ts
│       ├── feature-to-feature.test.ts
│       ├── public-api.test.ts
│       └── no-barrel.test.ts
└── dma/                        # @derived-modular/cli — consume @derived-modular/boundaries
    └── src/core/{discover,rules,index}.ts
```

---

### Task 1: Scaffold `@derived-modular/boundaries` + path API

**Files:**
- Create: `packages/boundaries/package.json`
- Create: `packages/boundaries/tsconfig.json`
- Create: `packages/boundaries/src/types.ts`
- Create: `packages/boundaries/src/constants.ts`
- Create: `packages/boundaries/src/path-utils.ts`
- Create: `packages/boundaries/src/classify-path.ts`
- Create: `packages/boundaries/src/index.ts`
- Test: `packages/boundaries/tests/classify-path.test.ts`

**Interfaces:**
- Consumes: absolute file paths + `srcRoot` + optional composition root dirnames
- Produces: `layerOfPath`, `moduleRefOfPath`, `isPublicImportTarget`, `isBarrelIndexFilename`, `DEFAULT_COMPOSITION_ROOT_DIRNAMES`, `LAYER_RANK`

- [ ] **Step 1: Write failing tests**

```ts
// packages/boundaries/tests/classify-path.test.ts
import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  isPublicImportTarget,
  layerOfPath,
  moduleRefOfPath,
} from "../src/index";

const srcRoot = "/proj/src";

describe("classify-path", () => {
  test("pages and routes map to app layer", () => {
    expect(
      layerOfPath(join(srcRoot, "pages/index.tsx"), {
        compositionRootDirnames: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
        srcRoot,
      })
    ).toBe("app");
    expect(
      layerOfPath(join(srcRoot, "routes/home.tsx"), {
        compositionRootDirnames: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
        srcRoot,
      })
    ).toBe("app");
  });

  test("feature dir module public vs deep", () => {
    const ctx = {
      compositionRootDirnames: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
      srcRoot,
    };
    const pub = join(srcRoot, "features/checkout/public/page.tsx");
    const deep = join(srcRoot, "features/checkout/ui/row.tsx");
    expect(moduleRefOfPath(pub, ctx)?.id).toBe("features/checkout");
    expect(isPublicImportTarget(pub, ctx)).toBe(true);
    expect(isPublicImportTarget(deep, ctx)).toBe(false);
  });

  test("stage-0 file module is fully public", () => {
    const file = join(srcRoot, "features/profile.tsx");
    const ctx = {
      compositionRootDirnames: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
      srcRoot,
    };
    expect(moduleRefOfPath(file, ctx)?.kind).toBe("file");
    expect(isPublicImportTarget(file, ctx)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd packages/boundaries && bun test`
Expected: FAIL (package/module missing)

- [ ] **Step 3: Implement package**

`packages/boundaries/package.json`:

```json
{
  "name": "@derived-modular/boundaries",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "test": "bun test",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "5.9.3"
  }
}
```

Implement `classify-path.ts` so that:

- Top segment in `compositionRootDirnames` → layer `"app"`
- `features|services|shared` → that layer
- Module: first path segment under `features/` or `services/` (file with extension → `kind: "file"`, else dir)
- Public: file module → true; dir module → path under `{module}/public/`
- `isBarrelIndexFilename`: `index.ts` | `index.tsx` only (AST re-export check stays in ESLint/CLI)

- [ ] **Step 4: Run tests — expect PASS**

Run: `cd packages/boundaries && bun test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/boundaries
git commit -m "$(cat <<'EOF'
feat(boundaries): add shared DMA path classifier

Pure path helpers for composition roots, layers, modules, and public surfaces.
EOF
)"
```

---

### Task 2: Wire `@derived-modular/cli` to `@derived-modular/boundaries`

**Files:**
- Modify: `packages/cli/package.json` (dependency `@derived-modular/boundaries`)
- Modify: `packages/cli/src/core/discover.ts` (import `DEFAULT_COMPOSITION_ROOT_DIRNAMES` from boundaries)
- Modify: `packages/cli/src/core/rules.ts` (use `layerOfPath` / shared helpers where equivalent)
- Modify: `packages/cli/src/index.ts` (re-export composition roots from boundaries if currently local)
- Test: existing `packages/cli` suite (no new fixtures required)

**Interfaces:**
- Consumes: `@derived-modular/boundaries`
- Produces: unchanged CLI public API; remove duplicated constants from discover when possible

- [ ] **Step 1: Add workspace dependency**

In `packages/cli/package.json` dependencies:

```json
"@derived-modular/boundaries": "workspace:*"
```

Run: `bun install` from repo root.

- [ ] **Step 2: Replace local composition-root constant**

In `discover.ts`, import `DEFAULT_COMPOSITION_ROOT_DIRNAMES` from `@derived-modular/boundaries` instead of defining locally. Keep `compositionRoots: string[]` absolute paths on `DiscoveredProject`.

- [ ] **Step 3: Align `layerOfFile` with boundaries**

In `rules.ts`, for non-module files, prefer `layerOfPath(file, { srcRoot, compositionRootDirnames })` (derive dirnames from `basename` of `project.compositionRoots` or pass defaults). Module-owned files still use `moduleOfFile` → module.layer.

- [ ] **Step 4: Regression**

Run: `cd packages/cli && bun test`
Expected: all existing tests PASS (including composition-root cases)

- [ ] **Step 5: Commit**

```bash
git add packages/cli/package.json packages/cli/src bun.lock
git commit -m "$(cat <<'EOF'
refactor(dma): use @derived-modular/boundaries for path layer classification

Keep graph analysis in CLI; share composition-root and layer path rules.
EOF
)"
```

---

### Task 3: Scaffold `@derived-modular/eslint-plugin` + `no-barrel`

**Files:**
- Create: `packages/eslint-plugin/package.json`
- Create: `packages/eslint-plugin/tsconfig.json`
- Create: `packages/eslint-plugin/src/index.ts`
- Create: `packages/eslint-plugin/src/settings.ts`
- Create: `packages/eslint-plugin/src/rules/no-barrel.ts`
- Test: `packages/eslint-plugin/tests/no-barrel.test.ts`

**Interfaces:**
- Consumes: `@derived-modular/boundaries`, `eslint` peer
- Produces: ESLint flat plugin with rule `no-barrel`

- [ ] **Step 1: Write RuleTester failing test**

Use `eslint` RuleTester (ESM). Fixture idea: file `src/features/widget/index.ts` with `export { x } from "./public/widget"` should error; `src/features/widget/public/widget.ts` without barrel should pass.

- [ ] **Step 2: Run — expect FAIL**

Run: `cd packages/eslint-plugin && bun test tests/no-barrel.test.ts`

- [ ] **Step 3: Implement plugin skeleton + rule**

`package.json` name: `@derived-modular/eslint-plugin`, peerDependencies `eslint: ">=9"`, dependency `@derived-modular/boundaries: workspace:*`.

`no-barrel`: on Program for files whose path is a barrel index filename under a features/services module, if any `ExportNamedDeclaration` / `ExportAllDeclaration` has `source`, report with message aligned to CLI.

- [ ] **Step 4: Tests PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(eslint-plugin): add @derived-modular/eslint-plugin with no-barrel

First file-scoped DMA rule for ESLint flat config.
EOF
)"
```

---

### Task 4: ESLint `public-api` + `feature-to-feature` + `layer-direction`

**Files:**
- Create: `packages/eslint-plugin/src/resolve-import.ts`
- Create: `packages/eslint-plugin/src/rules/public-api.ts`
- Create: `packages/eslint-plugin/src/rules/feature-to-feature.ts`
- Create: `packages/eslint-plugin/src/rules/layer-direction.ts`
- Modify: `packages/eslint-plugin/src/index.ts`
- Tests: one file per rule under `packages/eslint-plugin/tests/`

**Resolution strategy (v1):**

1. Try `eslint-module-utils/resolve` or ESLint 9 `sourceCode.parserServices` / `import/resolvers` if present in settings.
2. Fallback: resolve relative specifiers with `path` against the filename; for `@/`-style, join `projectRoot/srcRoot` when settings provide `srcRoot` (document that full alias parity needs a host resolver).
3. If still unresolved → no report.

Settings (plugin settings key `dma` or rule schema):

```ts
type DmaSettings = {
  srcRoot?: string; // default "src"
  compositionRoots?: string[]; // default DEFAULT_COMPOSITION_ROOT_DIRNAMES
};
```

- [ ] **Step 1: Tests for each rule (fail first)**

Mirror CLI fixtures:

- `public-api`: import `../features/a/ui/x` from another module → error; import `.../public/x` → ok; stage-0 file import → ok
- `feature-to-feature`: `features/a` → `features/b` → error
- `layer-direction`: `features` → `pages` or `shared` → `features` upward → error; `pages` → `features` → ok

- [ ] **Step 2: Implement rules using `@derived-modular/boundaries`**

Shared helper: `getDmaContext(context)` → `{ srcRootAbs, compositionRootDirnames, filename }`.

- [ ] **Step 3: Register all rules on plugin object**

- [ ] **Step 4: `bun test` in eslint-plugin — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(eslint-plugin): add public-api, feature-to-feature, layer-direction

Complete file-scoped DMA rule set for ESLint using @derived-modular/boundaries.
EOF
)"
```

---

### Task 5: `recommended` preset + README + root/skill docs

**Files:**
- Modify: `packages/eslint-plugin/src/index.ts` (`configs.recommended`)
- Create: `packages/eslint-plugin/README.md`
- Modify: `README.md` (root)
- Modify: `skills/dma/SKILL.md` and/or `skills/dma/references/reference.md`
- Modify: `packages/cli/README.md` (pointer: plugin ≠ full check)

- [ ] **Step 1: Export flat recommended config**

```ts
configs: {
  recommended: [
    {
      plugins: { '@derived-modular': plugin },
      rules: {
        "@derived-modular/layer-direction": "error",
        "@derived-modular/feature-to-feature": "error",
        "@derived-modular/public-api": "error",
        "@derived-modular/no-barrel": "error",
      },
    },
  ],
}
```

(Exact plugin key naming: prefer `dma` short name if package exports conventionally — document install as `import dma from "@derived-modular/eslint-plugin"`.)

- [ ] **Step 2: README content**

Must include:

- Install + flat config snippet
- Table: native rules vs CLI-only (`no-cycle`, inbound predicates, doctor)
- Explicit: **not a substitute for `dma check`**
- Settings: `srcRoot`, `compositionRoots`

- [ ] **Step 3: Root + skill one-liners**

- [ ] **Step 4: Manual smoke (optional)**

From a tiny fixture dir, run `bunx eslint` with the plugin if practical; otherwise RuleTester coverage is enough.

- [ ] **Step 5: Commit**

```bash
git add -f docs/superpowers/plans/2026-07-10-dma-linter-adapters.md 2>/dev/null || true
git commit -m "$(cat <<'EOF'
docs: document @derived-modular/eslint-plugin recommended setup

Clarify hybrid enforcement: ESLint file-scoped rules + dma check for graph.
EOF
)"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run all package tests**

```bash
bun test --cwd packages/boundaries
bun test --cwd packages/eslint-plugin
bun test --cwd packages/cli
```

Expected: all PASS

- [ ] **Step 2: Typecheck packages that define `check-types`**

```bash
bun run --cwd packages/boundaries check-types
bun run --cwd packages/eslint-plugin check-types
bun run --cwd packages/cli check-types
```

- [ ] **Step 3: Spec checklist**

- [ ] Four native rule ids match CLI  
- [ ] No graph rules in plugin  
- [ ] Composition roots treated as `app`  
- [ ] Docs say CLI still required  
- [ ] Biome/oxlint not shipped (deferred)

- [ ] **Step 4: Commit any fixups** (if needed)

---

## Out of scope (do not implement in this plan)

- `@derived-modular/biome-plugin` / GritQL shipping  
- oxlint JS plugin package  
- Autofix  
- Calling `analyze()` from ESLint  
- Publishing to npm (unless user asks separately)

## Deferred follow-ups

1. Biome GritQL best-effort (`no-barrel` first) — new spec  
2. oxlint wrapper when JS plugins stable — new spec  
3. Stronger shared resolver (tsconfig paths) inside plugin without host resolver
