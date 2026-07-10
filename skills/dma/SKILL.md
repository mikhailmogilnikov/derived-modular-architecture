---
name: dma
description: >-
  Applies Derived Modular Architecture (DMA) when placing or moving frontend
  files under src/{app,pages,routes,features,services,shared}, reviewing imports,
  promoting modules, choosing public API paths, migrating from FSD/ED, or running
  dma check / dma doctor / @derived-modular/* linters. Prefer this over inventing
  layers (widgets, entities) or barrels.
license: MIT
metadata:
  author: mikhailmogilnikov
  homepage: https://github.com/mikhailmogilnikov/derived-modular-architecture
---

# DMA (agent skill)

Rules come from the **filesystem + import graph**, enforced by tooling — not taste.

**Normative SoT (read when unsure):** [spec/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/spec)  
**Examples:** [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples)  
**Extra detail:** [references/reference.md](references/reference.md) (load only if needed)

## Hard gate

Before creating/moving anything under `src/`:

1. Run the **placement algorithm** below.
2. Do **not** invent FSD-style module layers (`widgets`, `entities`, or `pages`/`features` as taste ranks) or barrels (`index.ts` re-exports). `src/pages/` / `src/routes/` as **composition roots** are fine.
3. Prefer direct paths to `*/public/*` (stage-0 file modules are entirely public).

## Placement algorithm

Answer in order; **stop at first match**.

1. **Composition / wiring / route shell?** → composition root: `src/app/`, `src/pages/`, or `src/routes/` (thin mount of `*/public/*` only).
2. **Another module must import this module (product scenario)?** → target MUST be in `services/` (promote + review `public/`). Never `feature → feature`. One inbound module edge is enough.
3. **Portable helper/UI/type already imported by 2+ modules?** → `shared/{domain,lib,ui,api,model}` (second-use). Do not extract on first use.
4. **Only one consumer module?** → colocate inside that module (internal file or segment).
5. **New leaf UI/flow mounted only from composition root?** → `features/<name>` (stage 0 file or stage 1+ folder).
6. **Edge would cycle or go upward?** → consumer `public/ports.ts` + bind in composition root. Do **not** use ports to dodge a legal direct import / promotion.

### Quick predicates

| Path | Predicate |
| --- | --- |
| `app/` / `pages/` / `routes/` | Mounts modules; modules MUST NOT import it |
| `features/` | No inbound edges from other **modules** |
| `services/` | Has inbound from modules + product scenarios (create folder only on first promotion) |
| `shared/` | Portable infra/types — not product scenarios |

Inbound for promotion = edges from `features/*` or `services/*` only. Composition-root mounts do **not** promote.

`services` vs `shared` (last judgment): “Could this live unchanged in another product?” → yes `shared`, no `services`.

### Import cheat sheet

```text
app/pages/routes → features/*/public, services/*/public, shared
features         → services/*/public, shared     # ✗ features → features
services         → services/*/public, shared     # no cycles
shared           → shared only
outside module   → */public/* only (not ui/model/api internals)
```

`import type` **is** an edge.

## Agent workflow

1. **Inspect** real `src/{app|pages|routes,features,services?,shared}` and imports — do not assume FSD layers.
2. **Place/move** via the algorithm; rewrite imports to **direct** public files.
3. **Verify** if CLI is available:
   ```bash
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json   # soft signals; do not invent layers from these
   ```
   Exit: `0` ok · `1` check errors (must fix) · `2` env/args.
4. Use **editor linter plugins** when the project already has that linter (see below) — still run `npx @derived-modular/cli check` in CI.
5. Never “fix” with barrels, deep imports, empty `services/`, or ports that hide a legal downward import.

## Linter plugins (editor / `lint` script)

File-scoped only: `layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`.  
**Do not** treat them as a full audit — `no-cycle`, inbound predicates, and `doctor` exist only in the CLI.

| Stack | Package | Notes |
| --- | --- | --- |
| ESLint flat config | `@derived-modular/eslint-plugin` | Strongest file-scoped; prefer when ESLint is present |
| Oxlint | `@derived-modular/oxlint-plugin` | Same rules via JS plugins (alpha) |
| Biome | `@derived-modular/biome-plugin` | GritQL heuristics — weaker, no full resolve |

When configuring or reviewing lint setup, point at package READMEs / [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples) (each wires a matching adapter). Normative matrix: [spec/enforcement.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/enforcement.md).

## Refuse / rewrite

- Barrel `index.ts` / `index.tsx` re-export surfaces (what `no-barrel` checks)
- Nested / segmented `public/`
- `feature → feature` or upward imports
- Module in `services/` with **no** module inbound edges
- Extract to `shared` on first use
- Segments on stage 0–1
- App-level central contract registry (barrel of the whole graph)
- Port outside `public/ports.ts` (convention; CLI does not enforce the filename)
- Treating `shared-candidate` on a healthy `services/*/public/*` as a hard error
- “We’re fine, ESLint/Biome passed” without `dma check` in CI

## When to open more context

| Need | Open |
| --- | --- |
| Normative rules / assumptions / out-of-scope | [spec/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/spec) |
| Stages, triggers, shared groups, migration shorts, CLI ruleIds | [references/reference.md](references/reference.md) |
| Copy-paste layout + lint wiring | [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples) |
| Intentional violations (tests only) | `packages/cli/tests/fixtures/` |

## Out of scope

Domain-cut recipe, state-library choice, test pyramid, microfrontends, framework SSR details — only **where** code lives and **how** imports run. See [spec/out-of-scope.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/out-of-scope.md).
