---
name: dma
description: >-
  Applies Derived Modular Architecture (DMA) when placing or moving frontend
  files under src/{app,pages,routes,features,services,shared}, reviewing imports,
  promoting modules, choosing public API paths, migrating from FSD/ED, configuring
  dma.config.*, or running dma check / dma doctor / @derived-modular/* linters
  (including monorepo multi-root). Prefer this over inventing layers (widgets,
  entities) or barrels.
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

Before creating/moving anything under the source root (default `src/`):

1. Run the **placement algorithm** below.
2. Do **not** invent FSD-style module layers (`widgets`, `entities`, or `pages`/`features` as taste ranks) or barrels (`index.ts` re-exports). `src/pages/` / `src/routes/` as **composition roots** are fine.
3. Prefer direct paths to `*/public/*` (stage-0 file modules are entirely public).
4. If the project uses `dma.config.*`, honor `srcRoot` / `compositionRoots` (and monorepo `roots`) — do not assume hardcoded `src/`.

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

1. **Inspect** real `{srcRoot}/{app|pages|routes,features,services?,shared}` and imports — do not assume FSD layers. Check for `dma.config.*` first.
2. **Place/move** via the algorithm; rewrite imports to **direct** public files.
3. **Verify** if CLI is available:
   ```bash
   # single app (path with src/)
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json

   # monorepo root (no src/) — discovers apps; or explicit:
   npx @derived-modular/cli check .
   npx @derived-modular/cli check --roots apps/web,apps/admin
   npx @derived-modular/cli check . --include-packages
   ```
   Exit: `0` ok · `1` check errors (must fix) · `2` env/args/config.
4. Use **editor linter plugins** when the project already has that linter (see below) — still run `npx @derived-modular/cli check` in CI.
5. Never “fix” with barrels, deep imports, empty `services/`, or ports that hide a legal downward import.

## CLI: monorepo + config

**Multi-root:** if `path` has no source root → discover DMA apps (workspaces, else directory walk). Default: packages with composition roots. `--include-packages` also includes library packages with `features|services|shared`. Each root = **separate graph** (no cross-package merge).

**Optional `dma.config.{ts,mts,mjs,js,json}`** (upward lookup; `--config` override):

| Field | Default | Meaning |
| --- | --- | --- |
| `srcRoot` | `"src"` | Source directory name |
| `compositionRoots` | `["app","pages","routes"]` | Composition folders under srcRoot |
| `roots` | — | Explicit package roots (like `--roots`; relative to config file dir) |
| `includePackages` | `false` | Widen monorepo discovery |

Precedence: defaults < config < CLI flags. Helper: `defineConfig` from `@derived-modular/cli`.

## Linter plugins (editor / `lint` script)

File-scoped only: `layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`.  
**Do not** treat them as a full audit — `no-cycle`, inbound predicates, and `doctor` exist only in the CLI.

| Stack | Package | Notes |
| --- | --- | --- |
| ESLint flat config | `@derived-modular/eslint-plugin` | Strongest; reads `srcRoot`/`compositionRoots` from `dma.config.*` if `settings.dma` unset; `no-barrel` can autofix unique barrel imports |
| Oxlint | `@derived-modular/oxlint-plugin` | Same rules via JS plugins (alpha); inherits ESLint plugin behavior |
| Biome | `@derived-modular/biome-plugin` | GritQL heuristics — weaker; does **not** read `dma.config` |

When configuring or reviewing lint setup, point at package READMEs / [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples). Normative matrix: [spec/enforcement.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/enforcement.md).

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
- Passing monorepo root to `check` and expecting one merged graph (graphs stay per root)

## When to open more context

| Need | Open |
| --- | --- |
| Normative rules / assumptions / out-of-scope | [spec/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/spec) |
| Stages, triggers, shared groups, migration shorts, CLI ruleIds | [references/reference.md](references/reference.md) |
| Copy-paste layout + lint wiring | [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples) |
| Intentional violations (tests only) | `packages/cli/tests/fixtures/` |
| Monorepo / config docs | [guides/monorepo](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/apps/docs/content/docs/guides/monorepo.mdx), tooling `dma.config` |

## Out of scope

Domain-cut recipe, state-library choice, test pyramid, microfrontends, framework SSR details — only **where** code lives and **how** imports run. See [spec/out-of-scope.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/out-of-scope.md).
