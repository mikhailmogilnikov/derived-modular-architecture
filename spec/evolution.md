# Evolution

DMA scales by **densifying** the same architecture — never by rewriting into a different one. Folders appear lazily when predicates start carrying information.

## Project growth

1. **Start:** `app/` (or `pages/` / `routes/`) + `features/` + `shared/`. No `services/` folder.
2. **First promotion:** a module is needed by another module → create `services/`, move the target, revisit its public API. Graph tooling for cycles inside `services` becomes useful.
3. **Domains (narrative):** when the `services` subgraph is dense/deep or owned by multiple teams, split **horizontally** (`domains/billing/...` or packages) — never invent new vertical layers.

## Second-use rule

MUST NOT extract code “for later”. When a second consumer appears:

| Asset | Action |
| --- | --- |
| Feature used by another module | Promote to `services/` |
| Portable helper/UI/type used by 2+ modules | Lift to the matching `shared/` group |
| Type from a module `public/` needed by 2+ modules | Move to `shared/domain` (`import type` still counts as an edge) |

## Promotion

Promotion is a design moment: an API grown for one consumer is forced to become stable for dependents. CI enforces this via inbound predicates ([layers.md](./layers.md#feature-has-inbound)).

Composition-root mounts do **not** promote.

## Evolution triggers (defaults)

Numbers are **CLI defaults** (`DEFAULT_THRESHOLDS`); the principle is that thresholds are explicit and project-wide. v1 has no user config file — changing them requires tooling work.

| Signal | Action | Tooling |
| --- | --- | --- |
| File module gains a second file | Stage 1: folder + `public/` | `stage-growth` (sibling prefix) |
| ~8+ internal files / mixed segment names | Stage 2: segments | `stage-growth` (`stage1FileCount`) |
| Bloated `public/` implementations | Stage 3: split module | Review only (no doctor rule yet) |
| Feature needed by another module | Promote to `services/` | `feature-has-inbound` (one inbound edge) |
| Cycle between modules | Break via port + `app` wiring, or extract shared part | `no-cycle` |
| Dense `services` subgraph | Horizontal domain/package split | `dense-services` |
| `shared` helper used by one module | Move back into the module | Review / colocation |

## Doctor signals

Soft signals from `dma doctor` (exit 0 by default). They do **not** re-emit hard `check` rule IDs.

### shared-candidate

A module file is imported by 2+ other modules. Often a healthy `services/*/public/*` surface — confirm before lifting to `shared/`; portable helpers/UI/types are the usual extract targets.

### stage-growth

Module structure lags measured size (stage-0 siblings / stage-1 missing segments). Does **not** cover stage-3 splits.

### dense-services

`services` subgraph looks dense or deep enough to suggest a horizontal split.

### orphan-public

A `public/` file has no external importers — dead contract surface.
