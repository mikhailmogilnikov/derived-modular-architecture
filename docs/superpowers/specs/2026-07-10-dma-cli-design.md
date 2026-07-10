# DMA CLI v1 — Design

> Status: approved for implementation planning  
> Package: `packages/cli`  
> Related: [Derived Modular Architecture](../../derived-modular.md)

## Goal

Ship a CLI that is the **source of truth** for DMA enforcement and evolution signals on a single-app codebase:

- `dma check` — hard architectural rules for CI / pre-commit
- `dma doctor` — soft evolution signals (advice; does not fail CI by default)

The CLI is a thin front-end over an independent analyzer core. LSP, codemods, and linter adapters are out of scope for v1 but must consume the same core later.

## Non-goals (v1)

- Autofix / codemods (promote, rewrite imports)
- Scaffold / `init`
- LSP / editor server
- Monorepo multi-root and `domains/*` layout parsing
- Config file (`dma.config.*`)
- “Where should this file go?” placement API
- ESLint / Biome plugin adapters
- Watch mode, interactive TUI

## Decisions

| Topic | Choice |
|---|---|
| Role | Check + doctor (no fix) |
| Doctor depth | Invariant violations (via check) + evolution signals; no placement |
| Exit policy | Check fails on hard rules; doctor exits 0 by default |
| Project discovery | Zero-config: `src/{app,features,services?,shared}` |
| Shape | Single root only |
| Architecture | Own analyzer core + thin CLI (not cruiser wrapper, not ESLint generator) |

## Architecture

```
discover → parse imports → build graph → classify → rules/signals → report
```

### Package layout

```
packages/cli/
├── package.json          # bin: dma
├── src/
│   ├── core/             # analyze(projectRoot) → Result
│   ├── cli/              # argv, formatters, exit codes
│   └── index.ts          # public core API for future LSP
└── tests/
    └── fixtures/         # small src/ trees
```

**Boundary:** `core` never writes to stdout/stderr or calls `process.exit`. `cli` owns I/O and process lifecycle.

### Pipeline stages

1. **discover** — locate `src/`, layers, modules (stage-0 file or folder), `public/`, segments
2. **parse imports** — relative + tsconfig path aliases (`@/…`); `import type` counts as an edge
3. **build graph** — file nodes, module aggregation, module→module edges
4. **classify** — layer from path; module stage heuristic (0–2); inbound edges per module
5. **rules** (`check`) — hard diagnostics (`error`)
6. **signals** (`doctor`) — soft diagnostics (`info` / `warning`)
7. **report** — human / JSON / SARIF; exit code by command policy

## Project model (v1)

Assumed layout (zero-config):

```
src/
├── app/
├── features/
├── services/    # optional until first promotion
└── shared/
```

- A **module** is a top-level file under `features/` or `services/` (stage 0), or a top-level directory there (stage 1+). `app/` and `shared/` are layers, not modules.
- **Inbound edge** means an import from another **module** (`features/*` or `services/*`). Imports from `app/` do not count as inbound for layer predicates (app may mount features without promoting them).
- Outside a module, only `*/public/*` is importable; a stage-0 file module is entirely public.
- `shared/` has no `public/` pattern; its groups are importable as laid out.
- Missing `services/` is valid.

Unsupported in v1: multiple apps, workspace packages as DMA roots, `domains/*`.

## `dma check` — hard rules

All of the following are `severity: error` and produce exit code `1` when present.

| Rule ID | Meaning |
|---|---|
| `layer-direction` | Imports only downward: `app → features → services → shared` |
| `feature-to-feature` | `features` must not import `features` |
| `public-api` | Cross-module imports must target `*/public/*` (or a stage-0 file module) |
| `no-barrel` | No barrel `index.ts` / `index.tsx` re-export surfaces inside modules |
| `no-cycle` | No cycles in the module graph (including features when present) |
| `feature-has-inbound` | A feature with inbound edges from other modules (`features`/`services`) must live in `services/` |
| `service-no-inbound` | A service with no inbound edges from other modules violates its predicate |

**Not enforced in check v1:** product-vs-infra judgment on `services`/`shared`; ports convention beyond graph visibility; domain splits.

`feature-to-feature` and `feature-has-inbound` are complementary: an illegal feature→feature import is already an error; inbound on a feature also flags the target as needing promotion.

## `dma doctor` — soft signals

Default exit code `0`. Diagnostics are `info` or `warning`.

| Signal ID | When |
|---|---|
| `shared-candidate` | A file/symbol inside a module is imported by **2+** other modules (second-use rule) |
| `stage-growth` | Module structure lags measured size: stage 0 with 2+ related files without folder/`public/`; stage 1 large enough that segments are warranted (defaults below) |
| `dense-services` | `services` subgraph is dense/deep enough to suggest horizontal split (domains/packages) — advisory only; no `domains/*` support |
| `orphan-public` | A `public/` file has no external importers (`info`) |

Promotion is a **check** concern (`feature-has-inbound` / `feature-to-feature`). `doctor` does not re-emit those as soft advice.

### Default thresholds (hardcoded in v1)

| Trigger | Default |
|---|---|
| Second use → `shared-candidate` | ≥ 2 distinct consumer modules |
| Stage 0 → folder/`public/` hint | A stage-0 file module has ≥ 1 sibling source file in the same layer directory sharing its basename prefix (e.g. `checkout.tsx` + `checkout.store.ts`) |
| Stage 1 → segments hint | ≥ 8 source files in the module folder **or** ≥ 2 of `{ui,model,api}` filename prefixes present without corresponding segment directories |
| Dense services | ≥ 6 services **and** average outbound module edges ≥ 2, **or** longest path in the services module graph ≥ 4 |

Exact threshold constants live in core as named exports so a future config can override them without changing rule IDs.

## CLI interface

```
dma check [path]              # default: cwd; discovers src/
dma doctor [path]
dma check --format human|json|sarif
dma doctor --format human|json|sarif
```

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success (`check`: no errors; `doctor`: always, unless env failure) |
| `1` | Architectural errors from `check` |
| `2` | Environment / tool failure (missing `src/`, unreadable tree, broken tsconfig paths needed for resolve) |

### Report shapes

**Human (default):** one diagnostic per line/block with file path, rule id, message, and short help (“why” + “what to do”). Footer summary.

**JSON (`version: 1`):**

```ts
type Report = {
  version: 1;
  command: "check" | "doctor";
  diagnostics: Diagnostic[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
};

type Diagnostic = {
  ruleId: string;
  severity: "error" | "warning" | "info";
  message: string;
  file?: string;
  range?: { line: number; column: number; endLine?: number; endColumn?: number };
  help?: string;
};
```

**SARIF:** for GitHub code scanning; include file+position when available.

## Error handling

- Graph/rule findings → diagnostics (never thrown)
- I/O, discover failure, fatal parse/resolve setup → thrown from core / handled in CLI → exit `2`
- Unresolved individual imports: skip edge with optional `info` diagnostic in doctor later; v1 may omit noisy unresolved-import spam and only fail hard if tsconfig is required and missing/invalid

## Testing

Minimum for v1:

- Fixture projects under `tests/fixtures/`: clean, layer violation, feature→feature, deep import, cycle, inbound feature, service without inbound, shared-candidate
- Unit tests: module stage classification; `@/` alias resolve from tsconfig
- Golden snapshots: human + JSON for one clean and one dirty fixture

## Future (explicitly after v1)

1. Config file for paths and thresholds / enforced overrides
2. Codemods: promote feature→service, rewrite imports
3. LSP on the same core
4. Monorepo roots + `domains/*`
5. Placement API (“where to put this file”)
6. Linter adapters as report translators only

## Success criteria

- `dma check` on a DMA-shaped `src/` fails CI on every hard rule in this doc
- `dma doctor` surfaces second-use and stage-growth signals without failing CI
- Core API is importable without CLI side effects
- Zero config required for the default layout
