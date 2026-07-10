# DMA reference

Supplementary detail for the [dma](../SKILL.md) skill. Prefer `SKILL.md` for day-to-day placement.

## Canonical sources

- Full synthesis: https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/docs/derived-modular.md
- CLI package: https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/packages/dma (`@dma/cli`)

## Module stages (detail)

### Stage 0 — file module

```text
features/checkout.tsx
```

The whole file is the public surface. Import the file path, not a folder barrel.

### Stage 1 — flat folder

```text
features/checkout/
├── public/
│   └── checkout-page.tsx
├── use-cart-total.ts
└── cart-row.tsx
```

### Stage 2 — segments

```text
features/checkout/
├── public/          # flat entrypoints (implementations here)
├── ui/
├── model/
├── api/
└── lib/             # optional local helpers used by 2+ segments
```

### Stage 3 — split

Growing `public/` implementation entrypoints → split into sibling modules. If the extracted piece gains inbound module edges, it lands in `services/`.

### Stage 4 — packages

Multi-app reuse → monorepo packages; same semantics via `exports` / workspace deps.

## Evolution triggers (defaults)

| Signal | Action |
| --- | --- |
| Stage-0 file gains a related sibling | Stage 1: folder + `public/` |
| ~8 internals / clear ui·model·api clusters | Stage 2 segments |
| ~8+ implementation files in `public/` | Stage 3: split module |
| Feature needed by another module | Promote to `services/` + review API |
| Type from `public/` needed by 2+ modules | `shared/domain` (`import type` counts) |
| Cycle between modules | Port + `app` wiring, or extract shared part |
| Dense/deep `services` subgraph | Horizontal split (`domains/*` or packages) — not new vertical layers |
| Helper in `shared` used by one module | Push back into that module |

Exact numeric thresholds for `@dma/cli doctor` live in the package (`DEFAULT_THRESHOLDS`); treat them as project defaults, not dogma.

## `shared/` groups

| Group | Put | Don't put |
| --- | --- | --- |
| `ui/` | Product-agnostic primitives | Components that know cart/order/user |
| `lib/` | Pure utils, i18n, storage helpers | One-module helpers; dump `utils.ts` |
| `api/` | Base HTTP/WS client, interceptors | Feature endpoints |
| `model/` | Store/query client, env, flags | Feature business state |
| `domain/` | Global business types (`User`, `Money`) | Module-private types |

`shared` starts nearly empty except obvious bootstrap (base client, config, first primitives). Product code enters only on second use. No `public/` pattern inside `shared` until package stage.

## Cross-module mechanisms

### Direct import (default)

```ts
import { useCart } from "@/services/cart/public/use-cart";
```

### Owner event

```ts
// features/checkout/public/checkout.events.ts
export const checkoutCompleted = defineEvent<{ orderId: string }>("checkout-completed");

// app/wiring.ts — when reaction is not downward from subscriber
import { checkoutCompleted } from "@/features/checkout/public/checkout.events";
import { clearCart } from "@/services/cart/public/clear-cart";
checkoutCompleted.subscribe(clearCart);
```

### Consumer port (cycle / upward only)

```ts
// services/cart/public/ports.ts
export interface CheckoutPort {
  startCheckout(): void;
}
```

Wire in `app/providers.tsx`. Ports are runtime edges invisible to the import graph — keep them only in `public/ports.ts`. Using a port to avoid promoting a legally importable module is an antipattern.

## File conventions

- Tests: `*.test.ts` next to source; module integration tests in module `tests/`; e2e outside or under `app`
- Styles next to component
- Types: local → segment `types.ts` → `public/*.types.ts` for consumers
- Stories/mocks colocated (`*.stories.tsx`, `*.mock.ts`)
- **No `index.*` barrels**

## `@dma/cli` (v1)

```bash
dma check [path]                 # hard rules; exit 1 on errors
dma doctor [path]                # soft signals; exit 0 by default
dma check --format human|json|sarif
```

Exit codes: `0` ok · `1` check errors · `2` env/args failure.

Hard rules: `layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`, `no-cycle`, `feature-has-inbound`, `service-no-inbound`.

Doctor signals: `shared-candidate`, `stage-growth`, `dense-services`, `orphan-public`.

Inbound for promotion = edges from other modules only (not `app` mounts).

## Migration shorts

**From page/type-based:** create `app/`, `features/`, `shared/`; one module per page/flow; enable boundaries immediately; `services/` on first cross-import.

**From FSD:** collapse pages/widgets/features/entities of one domain into one module (`features/` or `services/` by inbound); `index.ts` → flat `public/`; replace `@x` with direct `public/` imports; break cycles with ports.

**From ED:** keep layer names; re-home by predicate (service without inbound → `features`; pure infra → `shared`); kill barrels.

## Manifests

Default: **zero** module manifests. Only allowed form is an **enforced override** that changes checker behavior (lie → CI fails). Never store layer/deps lists that merely echo the tree.

## What DMA does not solve

Domain cut recipe, state library, test pyramid, microfrontends, framework SSR — only placement and import graph.
