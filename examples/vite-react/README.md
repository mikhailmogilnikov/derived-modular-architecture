# Vite + React (DMA canon)

Runnable reference app for **Derived Modular Architecture** on Vite + React. Open this example to see **where** code goes: features, services, shared, providers, and colocated state.

## What this example teaches

| Topic | Where to look |
| --- | --- |
| Composition root | `src/app/app.tsx` — nav, badges, cross-feature wiring via props |
| Providers shell | `src/app/providers.tsx` — mounts `ThemeProvider` from `shared/ui` |
| Stage-0 feature file | `src/features/profile.tsx` — single-file module, entirely public |
| Stage-1+ folder modules | `checkout/`, `catalog/`, `notifications/` — `public/` + colocated internals |
| Colocated store | `checkout.store.ts`, `catalog.store.ts`, `notifications.store.ts` |
| Service promotion | `services/cart/public/cart.ts` — inbound from **catalog** and **checkout** |
| Shared UI | `shared/ui/` — Button, Card, Badge, Input, Theme |
| Shared lib | `shared/lib/` — `formatCurrency`, `classNames` (pure utils) |
| Shared model | `shared/model/product.ts` — `Product`, `Money` used by cart + catalog |
| Styling diversity | Global `app/app.css`, feature CSS modules/plain CSS/SCSS, shared UI modules, notifications CSS-in-JS |
| Colocated tests | `*.test.ts` beside stores, services, and shared lib (Vitest) |

### Mini-shop story

1. **Catalog** lists products, filters locally (`catalog.store`), adds items via `services/cart/public`.
2. **Checkout** reads the same cart service and keeps shipping choice in `checkout.store`.
3. **Notifications** owns its inbox store; **app** wires `onAddedToCart` → `addNotification` (no `feature → feature`).
4. **Profile** is a self-contained stage-0 card.
5. **App** shows cart/unread badges from service + notifications public APIs.

Cross-module rule in action: `catalog → services/cart`, `checkout → services/cart`, `app → */public/*`. There is **no** `feature → feature` import.

## Module evolution: checkout → cart

Cart logic did **not** start in `services/`. It was promoted when a second module needed the same product scenario.

| Phase | Location | Consumers | Files |
| --- | --- | --- | --- |
| **Colocated** (single consumer) | `features/checkout/` internal store | checkout only | Hypothetical `checkout.store.ts` holding cart items — see fixture [`stage-growth-0`](../packages/cli/tests/fixtures/stage-growth-0) |
| **Promoted** (second consumer) | `services/cart/public/` | catalog **and** checkout | [`cart.ts`](./src/services/cart/public/cart.ts), [`catalog-page.tsx`](./src/features/catalog/public/catalog-page.tsx), [`checkout-page.tsx`](./src/features/checkout/public/checkout-page.tsx) |

What stayed colocated: **shipping method** in [`checkout.store.ts`](./src/features/checkout/checkout.store.ts) — only checkout reads it. What moved: **cart items** because catalog calls `addCartItem` and checkout reads `getCartItems` / `cartTotal`.

```text
Before (1 consumer)              After (2 consumers)
───────────────────              ───────────────────
features/checkout/               features/catalog/public/ ──┐
  checkout.store.ts  (cart)      features/checkout/public/ ─┼──► services/cart/public/cart.ts
  public/checkout-page.tsx       features/checkout/
                                   checkout.store.ts (shipping only)
```

DMA detects the promotion via **inbound edges**: when catalog and checkout both import `services/cart/public/cart.ts`, the cart module belongs in `services/`, not inside either feature.

## Where to put X

| You have… | Put it in… | Example |
| --- | --- | --- |
| Page/screen mounted from app | `features/<name>/public/` or stage-0 `features/<name>.tsx` | `catalog-page.tsx`, `profile.tsx` |
| State used by one feature only | Colocated `*.store.ts` inside that feature | `checkout.store.ts`, `catalog.store.ts` |
| Logic reused by 2+ modules (product scenario) | `services/<name>/public/` | `cart.ts` (catalog + checkout) |
| Presentational component (no product logic) | `shared/ui/` | `button.tsx`, `card.tsx` |
| Pure helper (no feature imports) | `shared/lib/` | `format-currency.ts` |
| Type used by 2+ modules, portable | `shared/model/` | `product.ts` |
| Provider wiring / theme mount | `app/` (imports `shared/ui` primitives) | `providers.tsx` |
| API client for backend | `services/<name>/public/` or `shared/lib/http.ts` if truly portable | `http.ts` + `catalog.api.ts` |

### What must NOT go in `shared/`

- Feature-specific flows (checkout shipping, catalog filters)
- State with product scenarios (cart, auth session) — promote to `services/`
- Imports from `features/` or `services/` (shared is the bottom layer)
- Barrels (`index.ts` re-exports)

## State ownership rules

| State | Owner | Consumers import from |
| --- | --- | --- |
| Cart items | `services/cart` | `services/cart/public/cart.ts` |
| Shipping method | `features/checkout` (internal store) | relative `../checkout.store` inside module |
| Catalog filters / search | `features/catalog` (internal store) | relative `../catalog.store` inside module |
| Notification inbox | `features/notifications` (internal store) | `public/notifications-api.ts` when app must wire |

**Second-use rule:** cart started as checkout-only colocated state; catalog also needed `addCartItem` → promoted to `services/cart`. Do not pre-create empty `services/` folders.

**Cross-feature events:** catalog does not import notifications. App passes `onAddedToCart` prop — composition-only wiring, no code edge between features.

## Data fetching

Portable transport lives in `shared/`; feature-specific endpoints stay internal to the module.

| Layer | File | Role |
| --- | --- | --- |
| Portable fetch wrapper | `shared/lib/http.ts` | Thin `get<T>()` over `fetch` — reusable by any module |
| Feature API | `features/catalog/catalog.api.ts` | `fetchCatalogProducts()` — only catalog imports this |
| Static demo payload | `public/catalog.json` | Served by Vite; loaded at runtime from the catalog page |

`catalog-page.tsx` calls `fetchCatalogProducts()` in `useEffect` and keeps loading state in the UI. Other features do not import `catalog.api.ts` — if checkout needed the same HTTP client, it would import `shared/lib/http.ts`, not catalog internals.

For a real backend, replace `/catalog.json` with your API URL. Promote to `services/<name>/public/` when a second module needs the same product API.

## Colocated vs shared vs services

```
Only one consumer?     → colocate in that feature (checkout.store)
Two modules need it?   → services/ if product scenario (cart)
Portable + no product? → shared/ (formatCurrency, Button, Product type)
```

## Where to put styles

| Approach | DMA location | Example in this app | Teaches |
| --- | --- | --- | --- |
| **Global CSS** (resets, shell, site tokens) | `app/` — imported once from composition root | `app/app.css` → `app.tsx` | Only the app shell owns globals; features never import them |
| **CSS Modules** (feature-scoped) | Colocated with the owning `public/` entry | `catalog/public/catalog-page.module.css` | Scoped class names for one feature screen |
| **Plain colocated CSS** | Same — direct file import beside component | `checkout/public/checkout-page.css` | Simple feature skin without module syntax |
| **SCSS module** (optional) | Feature or `shared/ui` when nesting helps | `features/profile.module.scss` | Vite `sass` + modules for stage-0 feature |
| **CSS-in-JS** (style objects) | Feature **internal** until a second consumer | `notifications/notifications.styles.ts` | Colocate styling logic inside the module; not in `shared/` yet |
| **Shared UI modules** | `shared/ui/*.module.css` next to primitive | `button.module.css`, `card.module.css` | Portable themed primitives with their own scope |

### What must NOT go in `shared/`

- Feature-specific skins (catalog grid, checkout footer, notification inbox layout)
- One-off CSS-in-JS helpers used by a single feature
- Global resets or app nav — those belong in `app/`
- Style barrels — import the stylesheet file directly, same as TS public APIs

## Where to put tests

DMA is silent on the test runner — this example uses **Vitest** with **colocated** `*.test.ts` files next to the code they exercise:

| Code under test | Test file | Teaches |
| --- | --- | --- |
| `features/catalog/catalog.store.ts` | `features/catalog/catalog.store.test.ts` | Internal store beside its unit tests |
| `features/catalog/` (public surface) | `features/catalog/catalog.test.ts` | Optional module-level check via `public/` exports |
| `features/checkout/checkout.store.ts` | `features/checkout/checkout.store.test.ts` | Same colocation for checkout internals |
| `services/cart/public/cart.ts` | `services/cart/public/cart.test.ts` | Service public API tested in place |
| `shared/lib/format-currency.ts` | `shared/lib/format-currency.test.ts` | Portable helper at the bottom layer |

- **Unit tests** → colocate inside the same module folder (`*.test.ts` beside `*.store.ts`, `public/cart.ts`, etc.).
- **No root `__tests__/`** — tests travel with the module they protect.
- **E2E** (not included) → would live at the app root (`e2e/` or Playwright config beside `vite.config.ts`), exercising routes across modules.

## Commands

From this directory:

```bash
bun run dev        # Vite dev server
bun run build      # production bundle → dist/
bun run test       # vitest run (colocated unit tests)
bun run dma-check  # dma check . (hard architecture gate)
bun run lint       # ESLint + @derived-modular/eslint-plugin
```

From the monorepo root (build CLI/plugins first):

```bash
bun run build
bun run --cwd examples/vite-react dma-check
bun run --cwd examples/vite-react lint
bun run --cwd examples/vite-react build
bun run --cwd examples/vite-react test
```

## Workspace dependencies

This example is a workspace package under `examples/*`. `@derived-modular/cli` and `@derived-modular/eslint-plugin` are linked via `workspace:*` from the monorepo root.

## Project layout

```text
src/
├── app/                              # composition root
│   ├── app.tsx                       # nav, badges, feature mounting, prop wiring
│   ├── providers.tsx                 # ThemeProvider shell
│   └── app.css                       # global shell only
├── features/
│   ├── catalog/
│   │   ├── catalog.api.ts            # internal — fetch products for this module
│   │   ├── catalog.store.ts          # internal — filter/search state
│   │   ├── catalog.store.test.ts     # colocated store tests
│   │   ├── catalog.test.ts           # optional public-surface check
│   │   └── public/
│   │       ├── catalog-page.tsx
│   │       └── catalog-page.module.css
│   ├── checkout/
│   │   ├── checkout.store.ts         # internal — shipping state
│   │   ├── checkout.store.test.ts
│   │   └── public/
│   │       ├── checkout-page.tsx
│   │       └── checkout-page.css
│   ├── notifications/
│   │   ├── notifications.store.ts    # internal — inbox state
│   │   ├── notifications.styles.ts   # internal — CSS-in-JS objects
│   │   └── public/
│   │       ├── notifications-api.ts  # app-facing actions
│   │       └── notifications-panel.tsx
│   ├── profile.tsx                   # stage 0
│   └── profile.module.scss           # SCSS module for stage-0 feature
├── services/
│   └── cart/public/
│       ├── cart.ts                   # inbound: catalog + checkout
│       └── cart.test.ts
├── shared/
│   ├── lib/                          # format-currency, http, class-names (+ tests)
│   ├── model/                        # product types
│   └── ui/                           # button/card/badge/input (+ .module.css)
├── main.tsx                          # React mount (outside DMA layers)
public/
└── catalog.json                      # demo API payload for catalog.api.ts
```

No barrel `index.ts` files. Import direct file paths only.
