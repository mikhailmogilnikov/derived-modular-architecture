# Next.js App Router (DMA example)

Educational DMA example for **Next.js App Router**. Not a runnable Next app in v1 — enough source for `dma check`, ESLint, and a realistic import graph that shows **where** code goes across multiple features, services, and shared groups, including the **Server vs Client** boundary.

## Project map

```text
src/
├── app/
│   ├── globals.scss     # global styles — imported from layout.tsx
│   ├── layout.tsx       # Server — site shell + mounts <Providers>
│   ├── providers.tsx    # Client — wires session (and future ports/events)
│   └── page.tsx         # Server — thin route, mounts */public/* client pages
├── features/
│   ├── catalog/         # stage 1 — catalog.store + public/catalog-page
│   ├── checkout/        # stage 1 — checkout.store + public/checkout-page
│   ├── search/          # stage 1 — search.store + public/search-page
│   └── profile.tsx      # stage 0 — entire file is public
├── services/
│   ├── cart/public/     # inbound from catalog + checkout
│   └── session/public/  # inbound from profile (via provider in app)
└── shared/
    ├── domain/          # portable types (Product)
    ├── lib/             # format-currency
    └── ui/              # Button
```

Dependency direction: `app → features → services → shared`. Features never import other features.

## Server vs Client (RSC boundary)

Next.js App Router defaults to **Server Components**. DMA keeps the split at the **composition root** vs **feature public entries** — same layer rules, different React boundary.

| File | Boundary | Why |
| --- | --- | --- |
| [`layout.tsx`](./src/app/layout.tsx) | **Server** (default) | HTML shell, static header/footer, imports global styles — no hooks |
| [`page.tsx`](./src/app/page.tsx) | **Server** (default) | Thin route: mounts feature `public/` pages only; no feature internals |
| [`providers.tsx`](./src/app/providers.tsx) | **Client** (`"use client"`) | Wires `SessionProvider` — context requires a client boundary |
| [`session-provider.tsx`](./src/services/session/public/session-provider.tsx) | **Client** | `createContext` / `useContext` |
| [`catalog-page.tsx`](./src/features/catalog/public/catalog-page.tsx) | **Client** | `onClick`, reads colocated `catalog.store` |
| [`checkout-page.tsx`](./src/features/checkout/public/checkout-page.tsx) | **Client** | Reads `checkout.store` and cart service at runtime |
| [`search-page.tsx`](./src/features/search/public/search-page.tsx) | **Client** | Reads `search.store`; interactive search UI |
| [`profile.tsx`](./src/features/profile.tsx) | **Client** | `useSession()` hook |
| [`button.tsx`](./src/shared/ui/button.tsx) | Server-safe primitive | No `"use client"` — pulled into client bundle by feature pages that pass `onClick` |

```text
app/layout.tsx          (Server)
  └── app/providers.tsx (Client — session context)
        └── app/page.tsx        (Server)
              ├── features/catalog/public/catalog-page.tsx   (Client)
              ├── features/search/public/search-page.tsx     (Client)
              ├── features/checkout/public/checkout-page.tsx (Client)
              └── features/profile.tsx                       (Client)
```

**Pattern:** `page.tsx` stays a thin **server** composition root. Interactivity lives in **feature `public/` entries** (or a thin `providers.tsx` wrapper for cross-cutting context). Do not import `*.store.ts` from `page.tsx` — same DMA rule as always; the RSC boundary is an additional constraint on where hooks and event handlers may live.

## Where to put X

| You need… | Put it in… | Why |
| --- | --- | --- |
| Route file, layout, global providers | `src/app/` | Composition root — mounts modules, wires cross-cutting concerns |
| A product screen / flow mounted from a route | `features/<name>/public/<name>-page.tsx` | Leaf module; only `app` mounts it |
| State used by one feature only | Colocated next to the feature (`catalog.store.ts`) | Colocation until a second module needs it |
| Logic shared by 2+ modules with product meaning | `services/<name>/public/*` | Inbound edges from modules → `services/` (e.g. `cart` ← catalog + checkout) |
| Portable UI primitive (no product knowledge) | `shared/ui/` | Reused across modules; no API/model imports |
| Pure helper (dates, formatting) | `shared/lib/` | Second-use promotion; no product scenarios |
| Global business type reused by modules | `shared/domain/` | Portable types (`Product`); depends on nothing |
| Infra state (query client, env config) | `shared/model/` | Not used in this skeleton — see note below |
| Cross-module provider wiring | `app/providers.tsx` | `app` imports both sides downward and binds runtime context |
| Import from another module | `*/public/<file>` direct path | No barrels, no deep imports into internals |

### `app/` — keep it thin

- **`layout.tsx`** — HTML shell, header/footer, wraps children in `<Providers>`.
- **`providers.tsx`** — session provider, port bindings, event subscriptions. Both sides of a port are imported here (downward).
- **`page.tsx`** — only mounts feature public pages:

```tsx
import { CatalogPage } from "@/features/catalog/public/catalog-page";
import { CheckoutPage } from "@/features/checkout/public/checkout-page";
import { Profile } from "@/features/profile";
import { SearchPage } from "@/features/search/public/search-page";
```

```tsx
// ❌ never in app/
import { catalogStore } from "@/features/catalog/catalog.store";
import { checkoutStore } from "@/features/checkout/checkout.store";
```

### `features/` — product flows (leaves)

| Module | Colocated state | Public page | Imports |
| --- | --- | --- | --- |
| `catalog` | `catalog.store.ts` | `public/catalog-page.tsx` | `services/cart`, `shared/lib`, `shared/ui` |
| `checkout` | `checkout.store.ts` | `public/checkout-page.tsx` | `services/cart`, `shared/lib`, `shared/ui` |
| `search` | `search.store.ts` | `public/search-page.tsx` | `shared/ui` only |
| `profile` | — (stage 0 file) | `profile.tsx` | `services/session`, `shared/ui` |

Internals (`*.store.ts`) are imported with a **relative path** from that feature's `public/` file so linters do not flag cross-module deep imports.

### `services/` — shared product scenarios

| Module | Consumers | Role |
| --- | --- | --- |
| `cart` | `catalog`, `checkout` | `addToCart`, `cartTotal`, `cartItemCount` |
| `session` | `profile` (via `useSession`) | `SessionProvider` mounted in `app/providers.tsx` |

`services/` exists because **two modules import cart** — promotion from a single-consumer colocation.

### `shared/` — portable infrastructure

| Group | This example | Rule of thumb |
| --- | --- | --- |
| `domain/` | `product.ts` — `Product` type | Global types with no dependencies |
| `lib/` | `format-currency.ts` | Pure helpers; may import `domain` |
| `ui/` | `button.tsx` | Atoms with no product/API knowledge |
| `model/` | *(empty — intentional)* | Query client, env, route constants — add on second use |

`shared/model/` is omitted here on purpose: no infra-state is shared yet. When a second module needs the same query client instance, promote it to `shared/model/`.

## Where styles belong

DMA does not mandate a styling technology — only **colocation** and **layer boundaries**. This example shows three common placements:

| Style kind | Location | Example in this repo |
| --- | --- | --- |
| **Global** (resets, layout shell, site tokens) | `src/app/globals.scss` — imported once from `layout.tsx` | `body`, `.shop-grid`, `header`/`footer` |
| **SCSS module** (feature-scoped, nested syntax) | Next to the public page that owns the UI | `features/catalog/public/catalog-page.module.scss` → imported in `catalog-page.tsx` |
| **CSS module** (feature-scoped, plain CSS) | Same rule — colocate with the owning `public/` entry | `features/checkout/public/checkout-page.module.css` → imported in `checkout-page.tsx` |

Rules of thumb:

- **Colocate with the module** that owns the markup — put `*.module.scss` / `*.module.css` beside the `public/` page (or `shared/ui` primitive) that imports them.
- **Global styles only in `app/`** — site shell, CSS variables, resets. Never import globals from `features/` or `services/`.
- **`shared/ui/`** — portable primitives may ship a colocated `button.module.css` when a second consumer appears; until then, unstyled or inline props are fine.
- **No style barrels** — import the module file directly (`import styles from "./catalog-page.module.scss"`), same as TS public APIs.

Install `sass` when using SCSS modules (`devDependencies` in this example).

## Where to put tests

DMA is silent on the test runner — this example uses **Bun test** with **colocated** `*.test.ts` files next to the code they exercise:

| Code under test | Test file | Why colocated |
| --- | --- | --- |
| `features/catalog/catalog.store.ts` | `features/catalog/catalog.store.test.ts` | Store is internal to one feature |
| `features/checkout/checkout.store.ts` | `features/checkout/checkout.store.test.ts` | Same |
| `features/search/search.store.ts` | `features/search/search.store.test.ts` | Same |
| `services/cart/public/cart.ts` | `services/cart/public/cart.test.ts` | Public API of a promoted service |
| `shared/lib/format-currency.ts` | `shared/lib/format-currency.test.ts` | Portable helper |

Rules of thumb:

- **Unit tests** → colocate with the module under test (`*.test.ts` beside `*.store.ts`, `public/cart.ts`, etc.).
- **Do not** import feature internals from tests in other modules — test through `public/` when crossing module boundaries.
- **Integration / route tests** → `app/` or a top-level `tests/` folder (not used here); keep `app/` thin.
- **UI component tests** → beside the component (`catalog-page.test.tsx` next to `catalog-page.tsx`) when you add them.

Run `bun run test` from this directory.

## Mini-shop layout

1. **Catalog** — lists products, calls `addToCart` from `services/cart`
2. **Search** — standalone search UI with colocated `search.store`
3. **Checkout** — reads cart totals from `services/cart`, keeps shipping flag in `checkout.store`
4. **Profile** — reads session via `useSession` (provider wired in `app/providers.tsx`)

## ESLint DMA plugin

`eslint.config.js` extends `@derived-modular/eslint-plugin` with `compositionRoots: ["app", "pages", "routes"]`. Catches file-scoped mistakes (e.g. importing `catalog.store` from `page.tsx`).

Run `dma check` for the full graph (cycles, inbound predicates, public boundaries). ESLint does not replace it.

## Commands

```bash
bun run dma-check   # dma check .
bun run lint        # eslint .
bun run test        # bun test (colocated unit tests)
```

From repo root (build packages first):

```bash
bun run build
bun run --cwd examples/next-app dma-check
bun run --cwd examples/next-app lint
bun run --cwd examples/next-app test
```
