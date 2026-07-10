# Modules

A **module** is an element of `features/` or `services/`. Rules for `public/`, segments, and stages apply equally in both layers.

## Stages

Structure on each stage is a **superset** of the previous — no rewrite migrations.

### Stage 0 — file module

```text
features/
└── checkout.tsx
```

The whole file **is** the public surface. Import the file path, not a folder barrel.

### Stage 1 — flat folder

Triggered when a second file appears:

```text
features/checkout/
├── public/
│   └── checkout-page.tsx
├── use-cart-total.ts
└── cart-row.tsx
```

### Stage 2 — segments

Triggered when internal files grow (~8+ by CLI default `stage1FileCount`, or clear ui/model/api clusters). Soft signal: `stage-growth`.

```text
features/checkout/
├── public/          # flat entrypoints (implementations live here)
├── ui/
├── model/
├── api/
└── lib/             # optional helpers used by 2+ segments of this module
```

### Stage 3 — split

When `public/` has too many **implementation** entrypoints (rule of thumb ~8+; `*.types.ts`, `*.events.ts`, `ports.ts` do not count): **split the module**, do not nest `public/`. Review/convention in v1 — not a `doctor` signal yet.

### Stage 4 — packages

Multiple apps consume the module → extract to a monorepo package. Same rules; enforcement via package `exports` / workspace tags.

## public-api

Cross-module imports MUST target `*/public/*` with **direct file paths**.

- Stage-0 file modules: the entire file is public.
- Deep imports into `ui/`, `model/`, `api/`, etc. are forbidden across module boundaries.
- `public/` MUST stay **flat**. Entrypoint implementations live in `public/` and MAY import internal segments.
- A 1:1 re-export from `public/` to an internal file is allowed (symlink, not a barrel). Prefer implementing in `public/` by default.

```ts
// ✓
import { CheckoutPage } from "@/features/checkout/public/checkout-page";

// ✗ deep import
import { CartRow } from "@/features/checkout/ui/cart-row";

// ✗ barrel
import { CheckoutPage } from "@/features/checkout";
```

## no-barrel

Modules MUST NOT expose barrel `index` re-export surfaces (`index.ts` / `index.tsx` aggregating the module API). Absence of `index.*` makes the ban greppable.

## Segments (stage 2+)

| Segment | Role |
| --- | --- |
| `public/` | Visibility boundary — entrypoints, events, ports, external types |
| `ui/` | Presentation internals |
| `model/` | State and domain logic |
| `api/` | Module transport / DTO mapping |
| `lib/` | Local pure helpers used by 2+ segments |

Recommended internal direction (enable when it hurts, not on day one):

```text
public → ui, model, api, lib
ui     → model, lib
model  → api, lib
api    → lib
```

Names match `shared/` groups, but **rights differ**: module `ui` MAY import module `model`; `shared/ui` MUST NOT import `shared/model`.

## Colocation conventions

- Tests: `*.test.ts` next to the unit under test; module integration tests in module `tests/`; app e2e outside or under composition root.
- Styles: next to the component (CSS modules, scoped styles, etc.).
- Types: with the consumer; cross-module types via `public/*.types.ts` or `shared/domain` after second use.
- File names: kebab-case; name carries meaning without the folder (`use-cart-total.ts`, not `hook.ts`).

## Cross-module mechanisms

| Relation | Mechanism |
| --- | --- |
| Uses functionality below | Direct import of `services/*/public/*` |
| Notifies without knowing subscribers | Owner event in emitter `public/`; subscribe downward or wire in `app/` |
| Direct import would cycle or go upward | Consumer port in `public/ports.ts` + bind in composition root |
| Visual composition only | Slots/props in composition root |

Ports are runtime dependencies invisible to the static graph — keep them in `public/ports.ts` and do not use ports to bypass promotion predicates.
