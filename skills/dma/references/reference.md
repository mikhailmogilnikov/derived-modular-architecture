# DMA reference (agent supplement)

Load this only when `SKILL.md` is not enough. **Normative SoT:** [spec/](https://github.com/mikhailmogilnikov/derived-modular-architecture/tree/main/spec) — do not treat this file as higher authority than `spec/`.

## Module stages

| Stage | Shape | Trigger |
| --- | --- | --- |
| 0 | `features/checkout.tsx` | new module; whole file is public |
| 1 | `checkout/public/…` + flat internals | second related file |
| 2 | add `ui/`, `model/`, `api/`, optional `lib/` | ~8+ internals (CLI `stage1FileCount`) or clear clusters — `stage-growth` |
| 3 | split sibling modules | bloated `public/` implementations (review/convention; not a doctor signal) |
| 4 | packages | multi-app reuse |

- `public/` stays **flat**; growth → split module, not nest `public/`.
- Prefer implementation **in** `public/`; 1:1 re-export allowed, not default.
- No `index.*` barrels. Filenames: kebab-case, meaningful alone.

Detail: [spec/modules.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/modules.md)

## Evolution triggers

| Signal | Action |
| --- | --- |
| Stage-0 gains sibling file | Stage 1 |
| ~8+ internals / mixed ui·model·api names | Stage 2 segments (`stage-growth`) |
| Bloated `public/` implementations | Stage 3 split (review; no doctor rule yet) |
| Feature needed by **another** module | Promote to `services/` (one inbound edge) |
| Portable asset needed by 2+ modules | `shared/…` (second-use) |
| Cycle / upward | Port + composition-root wiring, or extract shared |
| Dense `services` | Horizontal split (`domains/*` / packages) — not new vertical layers |
| `shared` helper with one consumer | Move back into module |

Detail: [spec/evolution.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/evolution.md)

## `shared/` groups

| Group | Put | Don't |
| --- | --- | --- |
| `ui/` | Product-agnostic primitives | Knows cart/order/user |
| `lib/` | Pure utils | One-module helpers |
| `api/` | Base client, interceptors | Feature endpoints |
| `model/` | Query client, env, flags | Feature business state |
| `domain/` | Global business types | Module-private types |

```text
domain → (nothing)
lib    → domain
api    → lib, domain
model  → api, lib, domain
ui     → lib, domain          # ✗ api, ✗ model
```

Detail: [spec/shared.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/shared.md)

## Cross-module mechanisms

**Direct import (default):**

```ts
import { useCart } from "@/services/cart/public/use-cart";
```

**Owner event** — token in emitter `public/`; subscribe downward or wire in composition root.

**Consumer port** — only for cycle/upward; declare in `public/ports.ts`; bind in `app/`. Invisible to static graph — do not use to skip promotion.

Detail: [spec/modules.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/modules.md)

## CLI ruleIds

Hard (`dma check`): `layer-direction`, `feature-to-feature`, `public-api`, `no-barrel`, `no-cycle`, `feature-has-inbound`, `service-no-inbound`.

Soft (`dma doctor`): `shared-candidate`, `stage-growth`, `dense-services`, `orphan-public`.

`shared-candidate` = file imported by 2+ other modules — often a healthy `services/*/public/*`; confirm before moving to `shared/`.

File-scoped subset (not a substitute for `dma check`):

| Package | When |
| --- | --- |
| `@derived-modular/eslint-plugin` | ESLint flat config — strongest |
| `@derived-modular/oxlint-plugin` | Oxlint JS plugins (alpha) |
| `@derived-modular/biome-plugin` | Biome GritQL — heuristics only |

Matrix: [spec/enforcement.md](https://github.com/mikhailmogilnikov/derived-modular-architecture/blob/main/spec/enforcement.md)

## Migration shorts

**Page/type-based → DMA:** `app/` + `features/` + `shared/`; one module per flow; enable boundaries; `services/` on first cross-import.

**FSD → DMA:** collapse pages/widgets/features/entities of one domain into one module (by inbound); `index.ts` → flat `public/`; direct public imports; ports for cycles.

**ED → DMA:** keep layer names; re-home by predicate; kill barrels.

## Manifests

Default: **zero** module manifests. Only enforced overrides that change checker behavior (lie → CI fails).
