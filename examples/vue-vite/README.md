# Vue + Vite (DMA reference)

Runnable Vue 3 example with composition root `src/app/`, SFC modules, colocated composables, app-level `provide`/`inject`, and Biome via `@derived-modular/biome-plugin`.

Shared mini-shop domain: **catalog** (with search), **checkout**, **notifications**, stage-0 **profile**, **cart** service, and **shared** groups (`ui`, `lib`, `model`, `domain`).

## Where to put X

| You need… | Put it in… | Why |
| --- | --- | --- |
| Route shell, layout, global providers | `src/app/` | Composition root — mounts modules, wires cross-cutting concerns |
| Vue `provide` / `inject` wiring | `src/app/AppProviders.vue` | App imports downward and binds runtime context (theme key from `shared/domain`) |
| A product screen mounted from the app | `features/<name>/public/<name>-page.vue` | Leaf module; only `app` mounts it |
| Feature-only composable (`useCatalog`, `useCheckout`) | Colocated in the feature folder | Vue composables stay next to their only consumer until second module needs them |
| Feature-only store / filter state | `catalog.store.ts`, `checkout.store.ts`, … | Colocation until a second module imports it |
| Logic shared by 2+ modules with product meaning | `services/<name>/public/*` | Inbound edges from modules → `services/` (e.g. `cart` ← catalog + checkout) |
| Portable UI primitive (no product knowledge) | `shared/ui/` | Reusable atoms; no API/model imports |
| Pure helper (formatting, class names) | `shared/lib/` | Second-use promotion; may import `shared/model` or `shared/domain` |
| Portable business types reused by modules | `shared/model/` or `shared/domain/` | `Product` in `model/`; injection keys in `domain/` |
| Infra state (query client, env config) | `shared/model/` *(optional)* | Add when a second module needs the same infra instance — not used in this demo |
| Cross-module notification wiring | `app/App.vue` | App listens to catalog emit and calls `notifications/public/notifications-api` — no `feature → feature` |
| Import from another module | `*/public/<file>` direct path | No barrels, no deep imports into internals |

## Where to put styles

| You need… | Put it in… | Why |
| --- | --- | --- |
| Global reset, tokens, `body` typography | `src/app/app.css` | Imported once from `App.vue` — composition root owns app-wide baseline |
| Shell layout (nav, page chrome) | `src/app/App.vue` `<style scoped>` | Scoped to the app shell; uses CSS variables from `app.css` |
| Feature screen layout tied to one SFC | `features/<name>/public/<page>.vue` `<style scoped>` | e.g. catalog header copy, profile section spacing |
| Feature styles with hashed class names | `features/<name>/public/<page>.module.css` + `<style module src="…">` | e.g. `catalog-page.module.css` — CSS Modules colocated with the public page |
| Optional SCSS nesting in a feature | Same SFC with `<style lang="scss" scoped>` | e.g. `profile.vue` — add `sass` devDep; keep feature-only |
| Portable UI atom styles | `shared/ui/*.vue` `<style scoped>` | Reusable components; no product-specific selectors |
| Cross-feature page chrome | Prefer **not** — use `app.css` tokens + scoped SFC styles | Avoid global feature selectors; DMA modules stay isolated |

**Vue rules in this demo:** global baseline in `app/`, feature public pages own their look, `shared/ui` stays portable. CSS Modules demonstrate hashed classes without polluting the global namespace.

## Where to put tests

| You need… | Put it in… | Why |
| --- | --- | --- |
| Pure helper / formatter | `shared/lib/<name>.test.ts` next to the helper | No Vue runtime; fast unit tests |
| Service module logic (cart totals, subscriptions) | `services/<name>/public/<name>.test.ts` | Colocated with the public API under test |
| Feature store or composable logic | `features/<name>/<file>.test.ts` next to the source | e.g. `checkout.store.test.ts`, `use-catalog-search.test.ts` |
| SFC rendering / `mount()` | Optional — add `@vue/test-utils` when needed | This demo sticks to pure TS tests; no component test harness required |

**Runner:** Vitest via `vite.config.ts` (`test.environment: "node"`). Colocate `*.test.ts` in the same module folder as the code — no top-level `tests/` tree.

## What this example teaches

| Topic | Where to look |
| --- | --- |
| Composition root | `src/app/App.vue` — nav, status badges, mounts `*/public/*` |
| App providers | `src/app/AppProviders.vue` — `provide(shopThemeKey, …)` |
| `inject` in a feature | `src/features/profile.vue` — reads theme from app providers |
| Colocated composables | `use-catalog.ts`, `use-catalog-search.ts`, `use-catalog-cart.ts` in `features/catalog/` |
| Colocated store | `catalog.store.ts`, `checkout.store.ts` — relative import from `public/` |
| Service promotion | `services/cart/public/cart.ts` — inbound from catalog + checkout |
| Notifications wiring | `App.vue` calls `addNotification` on `@added-to-cart` — app binds modules |
| Shared lib (2 consumers) | `shared/lib/format-currency.ts` — catalog + checkout |
| Shared model | `shared/model/product.ts` — catalog data + cart service |
| Stage-0 feature | `src/features/profile.vue` — entire file is public |
| Global + scoped styles | `src/app/app.css` + `App.vue` scoped; catalog CSS Modules; profile SCSS |
| Colocated unit tests | `*.test.ts` next to cart, `format-currency`, stores, composables |

### Mini-shop story

1. **Catalog** — search/filter via colocated composables; adds products through `services/cart`.
2. **Checkout** — reads cart totals from `services/cart`; shipping choice in `checkout.store`.
3. **Notifications** — colocated `use-notifications` composable; app wires catalog events via public API.
4. **Profile** — injects shop theme provided in `AppProviders.vue`.

Cross-module rule: `catalog → services/cart`, `checkout → services/cart`, both → `shared/*`. There is **no** `feature → feature` import.

## SFC boundaries

| File | Layer | Notes |
| --- | --- | --- |
| `src/app/App.vue` | `app/` | Shell + nav; mounts `*/public/*` only |
| `src/app/AppProviders.vue` | `app/` | `provide` for cross-cutting Vue context |
| `features/catalog/public/catalog-page.vue` | feature `public/` | Relative imports to colocated composables + store |
| `features/checkout/public/checkout-page.vue` | feature `public/` | `use-checkout.ts` + `checkout.store.ts` |
| `features/notifications/public/notifications-panel.vue` | feature `public/` | `use-notifications.ts` composable |
| `features/profile.vue` | feature stage-0 | `inject(shopThemeKey)` |
| `services/cart/public/cart.ts` | service | Framework-agnostic cart state |
| `shared/ui/*` | `shared/ui` | Portable components |

`public/` files import internals with **relative paths** (`../use-catalog.ts`). Cross-module imports use `@/` aliases.

## Composables rule (Vue)

Keep composables in the feature folder unless a **second module** already imports the same logic — then promote per DMA (usually to `services/` for product state, or `shared/lib` for pure helpers only). This demo keeps `use-catalog-search.ts` in catalog because only catalog consumes search/filter state.

## Tooling

- **`dma check`** — graph rules (layers, public API, cycles). Required gate.
- **`biome check`** — `@derived-modular/biome-plugin` GritQL rules + Vue overrides in `biome.jsonc`.
- **`vitest run`** — colocated `*.test.ts` unit tests (pure TS; no `@vue/test-utils` in this demo).

## Commands

```bash
bun run dev
bun run build
bun run dma-check   # dma check .
bun run lint        # biome check .
bun run test        # vitest run
```

From the monorepo root (build CLI/plugins first):

```bash
bun run build
bun run --cwd examples/vue-vite dma-check
bun run --cwd examples/vue-vite lint
bun run --cwd examples/vue-vite test
bun run --cwd examples/vue-vite build
```

## Project layout

```text
src/
├── app/
│   ├── App.vue
│   ├── AppProviders.vue
│   └── app.css                       # global reset + CSS variables
├── features/
│   ├── catalog/
│   │   ├── public/
│   │   │   ├── catalog-page.vue      # scoped + CSS Modules
│   │   │   └── catalog-page.module.css
│   │   ├── catalog.data.ts
│   │   ├── catalog.store.ts
│   │   ├── use-catalog.ts
│   │   ├── use-catalog-search.ts
│   │   ├── use-catalog-search.test.ts
│   │   └── use-catalog-cart.ts
│   ├── checkout/
│   │   ├── public/checkout-page.vue
│   │   ├── checkout.store.ts
│   │   ├── checkout.store.test.ts
│   │   └── use-checkout.ts
│   ├── notifications/
│   │   ├── public/notifications-api.ts
│   │   ├── public/notifications-panel.vue
│   │   ├── notifications.store.ts
│   │   └── use-notifications.ts
│   └── profile.vue
├── services/
│   └── cart/public/
│       ├── cart.ts
│       └── cart.test.ts
├── shared/
│   ├── domain/shop-theme.ts
│   ├── lib/
│   │   ├── format-currency.ts
│   │   └── format-currency.test.ts
│   ├── model/product.ts
│   └── ui/
└── main.ts
```

No barrel `index.ts` files. Import direct file paths only.
