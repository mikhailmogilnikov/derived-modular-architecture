# Layers

Layers are **predicates**, not taste-assigned ranks. Membership is derived from the filesystem and the import graph.

## Default tree

```text
src/
├── app/         # composition root (also: pages/, routes/)
├── features/    # leaf modules — no inbound edges from other modules
├── services/    # modules with inbound edges (created on first promotion)
└── shared/      # portable ui / lib / api / model / domain
```

`services/` MUST NOT exist until the first promotion. Until then, rules that mention `services/` are dormant.

## Layer predicates

| Layer | Predicate |
| --- | --- |
| Composition root (`app/`, `pages/`, `routes/`) | Mounts modules; MUST NOT be imported by modules |
| `features/` | No inbound edges from other **modules** (only mounted from composition roots) |
| `services/` | Has inbound edges from modules **and** implements product scenarios |
| `shared/` | Has inbound edges **and** does not implement product scenarios |

Machine-checkable: inbound edges, direction, acyclicity.  
Judgment remaining: product scenario vs portable infra on the `services` / `shared` boundary. Heuristic: “Could this code live unchanged in another product?” — yes → `shared`, no → `services`.

## Composition roots

Under `src/`, any of `app/`, `pages/`, and `routes/` is a **composition root** (same semantic layer as DMA `app/`):

- MAY mount features/services via `*/public/*`
- Mounts do **not** count as inbound edges for promotion
- Route/page files SHOULD stay thin shells over public APIs

Prefer `app/` when multiple composition roots exist; tooling may pick `app` first among discovered roots.

## Why only two module layers

Module rank in a dependency graph is continuous, but there is one qualitative jump in obligations: “nobody depends on me” vs “others depend on me”. Extra FSD-style layers (`widgets`, `entities`) quantize continuous size/semantics and invite endless debate. A layer is legal only when both sides of the boundary have **checkably different obligations**.

## Dependency direction

```text
app/pages/routes  →  features/*/public, services/*/public, shared
features          →  services/*/public, shared     (✗ features → features)
services          →  services/*/public, shared     (acyclic within services)
shared            →  shared
```

- ✗ Any upward edge  
- ✗ Outside a module → module internals (only `*/public/*`, except stage-0 whole-file modules)

### layer-direction

Imports MUST only go downward in layer rank: composition root → features → services → shared.

### feature-to-feature

A feature MUST NOT import another feature. Need shared behavior → promote the target to `services/` (or lift portable code to `shared/`).

### no-cycle

The module graph MUST be acyclic. Cycles are resolved by: direct downward import after promotion, owner events + wiring in the composition root, or a consumer port bound in `app/` (see [modules.md](./modules.md) and [evolution.md](./evolution.md)).

### feature-has-inbound

A feature that has inbound edges from other modules MUST live under `services/`.

### service-no-inbound

A service with no inbound edges from other modules violates its predicate (demote or delete).

Inbound edges are counted from **modules** only (`features/*`, `services/*`). Composition-root mounts do not promote.
