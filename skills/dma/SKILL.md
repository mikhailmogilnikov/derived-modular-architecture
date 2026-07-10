---
name: dma
description: >-
  Applies Derived Modular Architecture (DMA): layer predicates, public API without
  barrels, colocation, second-use promotions, and module evolution stages. Use when
  placing or moving frontend files, designing modules, reviewing imports/structure,
  migrating from FSD/ED, or working with `@derived-modular/cli` / `dma check` / `dma doctor` /
  `src/{app,features,services,shared}`.
license: MIT
metadata:
  author: mikhailmogilnikov
  homepage: https://github.com/mikhailmogilnikov/derived-modular-architecture
---

# Derived Modular Architecture (DMA)

Rules are **derived from the filesystem and import graph**, then enforced by tooling — not taste.

Long-form spec: [docs/derived-modular.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/docs/derived-modular.md)  
CLI: [`@derived-modular/cli`](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/cli)  
ESLint: [`@derived-modular/eslint-plugin`](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/eslint-plugin) (file-scoped only — still run `dma check`)  
Biome: [`@derived-modular/biome-plugin`](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/biome-plugin) (best-effort GritQL)  
Oxlint: [`@derived-modular/oxlint-plugin`](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/oxlint-plugin) (same rules as ESLint via JS plugins)  
Detail cheat sheets: [references/reference.md](references/reference.md)

## Install (skills.sh)

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
```

**Examples:** copy-paste starters live in [examples/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/examples) — runnable Vite+React canon plus framework skeletons.

## Hard gate

Before creating/moving files under `src/`, run the **placement algorithm** below. Do not invent layers (`widgets`, `entities`, `pages`) or barrels (`index.ts` re-exports).

## Four invariants

1. **Downward imports only:** `app → features → services → shared`
2. **Public API without barrels:** cross-module → only `*/public/*` (direct file paths); stage-0 file modules are entirely public
3. **Colocation by default:** code lives next to its only consumer until second use
4. **Second-use rule:** never extract “for later”; second consumer → lift one level up

Anything not machine-checkable is a wish, not a rule — except the last judgment: **product scenario vs portable infra** on the `services` / `shared` boundary.

## Layer predicates

| Layer | Predicate |
| --- | --- |
| `app/` | Composition root; mounts modules; nobody imports it. Also: `pages/`, `routes/` under `src/` (framework routers) |
| `features/` | **No** inbound edges from other modules (only mounted from `app`) |
| `services/` | **Has** inbound edges from modules **and** product scenarios |
| `shared/` | Has inbound edges **and** no product scenarios (portable) |

`services/` is created **lazily** on first promotion — never empty “for later”.

Inbound edges count only from other **modules** (`features/*`, `services/*`). Mounts from `app/` do **not** promote a feature.

Heuristic for `services` vs `shared`: “Could this code live unchanged in another product?” → yes `shared`, no `services`.

## Placement algorithm

Answer in order; stop at first match.

1. **Composition / wiring / route shell?** → `app/` (thin framework route files mount `*/public/*`).
2. **Used by 2+ modules already (measured)?**
   - Product scenario → promote owning module to `services/` (or put new code there if it belongs to that module).
   - Portable types/helpers/ui/transport → `shared/{domain,lib,ui,api,model}`.
3. **Only one consumer module?** → colocate inside that module (internal file or segment).
4. **New leaf UI/flow mounted only from app?** → `features/<name>` (stage 0 file or stage 1+ folder).
5. **Another module must import this module?** → target must be in `services/` (promote + review `public/`). Never `feature → feature`.
6. **Would the edge create a cycle or upward dependency?** → consumer port in `public/ports.ts` + bind in `app`. Do **not** use ports to dodge promotion.

### Inside a module (stages)

| Stage | Shape | Trigger |
| --- | --- | --- |
| 0 | `features/checkout.tsx` | new module |
| 1 | `checkout/public/…` + flat internals | second related file |
| 2 | add `ui/`, `model/`, `api/`, optional `lib/` | ~8 files or clear segment clusters |
| 3 | split into sibling modules | `public/` has ~8+ **implementation** entrypoints (`*.types.ts`, `*.events.ts`, `ports.ts` do not count) |
| 4 | packages / monorepo | multi-app reuse |

- `public/` is always **flat**; growing it means **split the module**, not nest `public/`.
- Prefer implementation **in** `public/`; 1:1 re-export from internals is allowed but not the default.
- **No `index.*` barrels** in the project modules.
- File names: kebab-case, meaningful without the folder (`use-cart-total.ts`, not `hook.ts`).

### Cross-module links (pick by relation)

| Relation | Mechanism |
| --- | --- |
| Uses lower module | Direct import of its `public/` file |
| Notifies unknown subscribers | Owner event in emitter `public/`; subscribe downward, else wire in `app` |
| Cycle / upward | Port in consumer `public/ports.ts` + provider in `app` |
| Visual composition only | Slots/props in `app`, no code edge |

`import type` **is** an edge (can force promotion or `shared/domain`).

## Dependency rules (cheat sheet)

```text
app      → features/*/public, services/*/public, shared
features → services/*/public, shared     # ✗ features → features
services → services/*/public, shared     # DAG / no cycles
shared   → shared only
outside  → */public/* only (not module internals)
```

`shared` groups (same names as segments, different rights):

```text
domain → (nothing)
lib    → domain
api    → lib, domain
model  → api, lib, domain
ui     → lib, domain          # ✗ api, ✗ model
```

Inside a module (enable when painful):

```text
public → ui, model, api, lib
ui     → model, lib
model  → api, lib
api    → lib
```

## Agent workflow

1. Inspect existing `src/{app,features,services?,shared}` and real imports (not assumed layers).
2. Place/move code via the algorithm; update import paths to **direct** `public/` files.
3. If `@derived-modular/cli` is available, run:
   - `dma check [path]` — hard errors must be fixed (exit `1`)
   - `dma doctor [path]` — soft evolution signals (inform; don’t invent extra layers)
4. Optional editor feedback:
   - `@derived-modular/eslint-plugin` — stronger file-scoped rules
   - `@derived-modular/biome-plugin` — best-effort GritQL heuristics
   - `@derived-modular/oxlint-plugin` — same rules as ESLint via Oxlint JS plugins
   - Neither replaces `dma check` (cycles / inbound predicates).
5. Prefer JSON for automation: `dma check --format json`.
6. Never “fix” violations with barrels, deep imports, empty `services/`, or ports that hide a legal direct import.

## Antipatterns (refuse)

- Barrel `index.ts` re-export surfaces
- Nested / segmented `public/`
- `feature → feature` or upward imports
- Module in `services/` with **no** module inbound edges
- Extract to `shared` on first use
- Segments on stage 0–1
- App-level central contract registry (barrel of the whole graph)
- Port outside `public/ports.ts`, or port used to skip promotion

## Out of scope for DMA itself

Domain slicing recipe, state-management library choice, test pyramid, microfrontends, framework SSR details — only **where** code lives and **how** imports run.

## Additional resources

- [references/reference.md](references/reference.md) — stages, triggers, shared groups, migration hints
- Spec: https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/docs/derived-modular.md
- CLI: `npx @derived-modular/cli` / https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/cli
