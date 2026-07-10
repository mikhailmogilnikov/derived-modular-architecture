# DMA linter adapters — Design

> Status: approved for implementation planning  
> Related: [Derived Modular Architecture](../../derived-modular.md), [DMA CLI v1](./2026-07-10-dma-cli-design.md)

## Goal

Ship **file-scoped** DMA enforcement inside existing linter pipelines (editor + `lint` scripts), while keeping **`dma check` / `dma doctor` as the source of truth** for full graph audit.

Primary deliverable: **`@dma/eslint-plugin`**. Biome and oxlint follow later with best-effort coverage, not full parity.

## Decisions

| Topic | Choice |
| --- | --- |
| Strategy | Hybrid: native rules where file/path-scoped; full audit via CLI |
| Priority | ESLint first; Biome / oxlint later and possibly reduced |
| Native rule set (v1) | `no-barrel`, `layer-direction`, `feature-to-feature`, `public-api` |
| CLI-only | `no-cycle`, `feature-has-inbound`, `service-no-inbound`, all `doctor` signals |
| Packaging | `@dma/eslint-plugin` + shared `@dma/boundaries`; core stays `@dma/cli` |
| Architecture | Shared path classifier + native ESLint rules (not boundaries-preset wrapper, not `analyze()` from ESLint) |

## Non-goals (this increment)

- Autofix / codemods in linter rules
- Emitting doctor signals from linters
- Calling `analyze()` / spawning CLI from ESLint
- LSP
- Full Biome / oxlint parity in the same release
- `dma.config.*` beyond plugin options `srcRoot` / `compositionRoots`
- Reimplementing graph rules inside any linter

## Architecture

```text
@dma/boundaries          # pure path helpers (no FS graph, no ESLint)
        ↑
@dma/eslint-plugin       # file-scoped rules (v1 deliverable)
@dma/cli                 # full graph check/doctor (unchanged role)
        ↑ later
biome grit / oxlint      # best-effort subset, same rule ids where possible
```

### Package roles

| Package | Does | Does not |
| --- | --- | --- |
| `@dma/boundaries` | Classify paths: layer, composition root, module id, stage-0 vs dir, public surface, barrel index candidate | Build import graph; parse tsconfig aliases |
| `@dma/eslint-plugin` | Rules on Import/Export AST + boundaries; flat `recommended` preset | Call `analyze()`; emulate cycle / inbound predicates |
| `@dma/cli` | Full `check` / `doctor` | Depend on ESLint |

**Contract:** same `ruleId` strings as CLI (`layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`). Messages/help should match CLI wording where practical.

### Monorepo layout

```text
packages/
├── dma/                 # @dma/cli (consumes @dma/boundaries for path heuristics where applicable)
├── boundaries/          # @dma/boundaries
└── eslint-plugin/       # @dma/eslint-plugin
```

## `@dma/boundaries`

Pure functions over absolute paths + `srcRoot` / composition-root dirnames.

Must support (aligned with current CLI):

- Layers: `app` | `features` | `services` | `shared`
- Composition roots under `src/`: default `app`, `pages`, `routes` → semantic layer `app`
- Module identity for `features/*` and `services/*` (file module vs directory module)
- `isPublicImportTarget` (stage-0 entire file; dir module only `public/`)
- Barrel candidate detection helpers used by `no-barrel` (filename `index.ts` / `index.tsx`; re-export check stays in the linter via AST)

No I/O beyond what callers pass in. No dependency on ESLint or TypeScript compiler API.

## `@dma/eslint-plugin` (v1)

### Rules

All severity `error` in `recommended`.

| Rule | File-scoped trigger |
| --- | --- |
| `layer-direction` | Import from layer A to layer B where rank(A) < rank(B). Composition roots map to `app`. |
| `feature-to-feature` | Both ends are different modules under `features/`. |
| `public-api` | Import into another **directory** module outside its `public/`; stage-0 file modules are fully public. |
| `no-barrel` | Module contains `index.ts` / `index.tsx` with `export … from` (same criterion as CLI). |

### Resolution

Rules operate on **resolved** import targets inside the project. Unresolved / external package imports are ignored.

v1 expects a working resolver in the host ESLint setup (e.g. TypeScript / node resolver). Plugin options:

- `srcRoot` — default `"src"`
- `compositionRoots` — default `["app", "pages", "routes"]`

### Preset

Flat config: `dma.configs.recommended` (and documented legacy-compatible name if needed). Enables all four rules as `error`.

### Peers

`eslint` >= 9 (flat config).

## CLI relationship

- `dma check` remains mandatory for CI completeness (graph rules).
- Docs must state clearly: ESLint plugin is **not** a replacement for `dma check`.
- Refactor CLI path classification to use `@dma/boundaries` where it reduces duplication; graph pipeline stays in `@dma/cli`.

## Biome and oxlint (follow-up)

Not in the same implementation plan as ESLint v1; documented roadmap only:

**Biome**

- Ship GritQL plugins (package or `*.grit` files) for patterns Grit can express — especially `no-barrel`.
- Path-based import rules only if expressible without full resolve; otherwise README → use `dma check`.
- WASM / JS Biome plugin APIs — out of scope until stable.

**oxlint**

- When JS plugins are mature enough: thin wrapper reusing `@dma/boundaries` + AST, same rule ids.
- Until then: documented gap + CLI.

**Invariant:** neither Biome nor oxlint implements graph rules.

## Testing

- `@dma/boundaries`: unit tests on path fixtures (composition roots, stage-0, public vs deep, layer ranks).
- `@dma/eslint-plugin`: RuleTester cases mirroring CLI fixtures (`layer-violation`, `feature-to-feature`, `deep-import`, `barrel`) plus clean negatives.
- Regression: existing `@dma/cli` tests stay green after boundaries extraction.

## Documentation

- `@dma/eslint-plugin` README: flat-config snippet, native vs CLI-only table, “not a substitute for `dma check`”.
- Root README + DMA skill: one-line pointer to the ESLint adapter.
- Optional later: Biome/oxlint install notes when those packages exist.

## Delivery order

1. `@dma/boundaries` + wire CLI path heuristics to it  
2. `@dma/eslint-plugin` + `recommended` + tests + README  
3. Root/skill docs touch  
4. Biome / oxlint — separate spec/plan when ready  

## Success criteria

- Enabling `recommended` surfaces the four file-scoped violations in ESLint/IDE with DMA rule ids.
- Projects that only use the plugin still need `dma check` to catch cycles and layer-predicate (inbound) errors.
- No second implementation of the import graph inside any linter adapter.
