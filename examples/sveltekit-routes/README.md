# SvelteKit routes (DMA breadth)

Educational DMA example for **SvelteKit + Svelte 5**: horizontal breadth across features, a promoted service, shared `ui` + `lib`, and app-level wiring in `src/routes/`.

Shared mini-shop story: browse **catalog**, pay in **checkout**, edit **profile**, read **promo** — with **cart** shared by catalog and checkout.

## What this example teaches

| Topic | Where to look |
| --- | --- |
| Composition root | `src/routes/+page.svelte` — thin shell, mounts `features/*/public/*` and stage-0 modules |
| App providers / wiring | `src/routes/app-providers.svelte` — subscribes to `checkout.events`, calls `clearCart` (both imports downward) |
| Layout wrapper | `src/routes/+layout.svelte` — wraps pages with `AppProviders` |
| Stage-1 folder module | `src/features/catalog/`, `src/features/checkout/` — `public/*` + colocated `*.store.ts` |
| Stage-0 file modules | `src/features/profile.svelte`, `src/features/promo.svelte` |
| Service promotion | `src/services/cart/public/cart.ts` — inbound edges from **catalog** and **checkout** |
| Shared portable UI | `src/shared/ui/button.svelte`, `card.svelte` |
| Shared portable lib | `src/shared/lib/format-currency.ts` — no product scenarios |
| Cross-module events | `src/features/checkout/public/checkout.events.ts` — app wires subscribers |
| Svelte 5 runes | `$state` in profile, `$props` / `$effect` in providers and shared UI |

### Mini-shop flow

1. **Catalog** filters products (colocated `catalog.store.ts`) and calls `addCartItem` from the cart service.
2. **Checkout** reads `cartItems` / `cartTotal` from the same service and keeps payment status in `checkout.store.ts`.
3. **AppProviders** listens for `checkoutCompleted` and clears the cart — no `feature → feature` edge.
4. **Profile** and **Promo** are self-contained stage-0 modules using shared `Card` and `formatCurrency`.

Cross-module rule in action: `catalog → services/cart`, `checkout → services/cart`, both → `shared/*`. There is **no** `feature → feature` import.

## Placement guide (SvelteKit)

DMA treats `src/routes/` like `app/` — the composition root. Route files stay thin.

```text
src/
├── app.css                         # global base styles
├── routes/                         # composition root (≈ app/)
│   ├── +layout.svelte              # imports app.css, mounts AppProviders
│   ├── +page.svelte                # page wiring only
│   └── app-providers.svelte        # theme CSS variables + event wiring
├── features/
│   ├── catalog/
│   │   ├── catalog.store.ts        # internal — catalog-only filter state
│   │   ├── catalog.store.test.ts   # colocated store test
│   │   └── public/catalog-page.svelte
│   ├── checkout/
│   │   ├── checkout.css            # feature stylesheet (imported from public/)
│   │   ├── checkout.store.ts
│   │   └── public/
│   │       ├── checkout-page.svelte
│   │       └── checkout.events.ts
│   ├── profile.svelte              # stage 0
│   └── promo.svelte                # stage 0
├── services/
│   └── cart/public/
│       ├── cart.ts                 # promoted: catalog + checkout import it
│       └── cart.test.ts            # colocated service test
└── shared/
    ├── lib/
    │   ├── format-currency.ts
    │   └── format-currency.test.ts
    └── ui/{button,card}.svelte
```

### Where to put new code

| Question | Place |
| --- | --- |
| Route shell, layout, providers? | `src/routes/` |
| UI flow mounted only from routes? | `features/<name>/public/*` (or stage-0 `features/<name>.svelte`) |
| State used only inside one feature? | Colocate: `features/<name>/<name>.store.ts` |
| Logic reused by 2+ modules with product meaning? | `services/<name>/public/*` (lazy-create `services/` on first promotion) |
| Portable helper or UI with no product scenario? | `shared/lib/*` or `shared/ui/*` |
| Break a cycle or wire subscribers? | Consumer `public/ports.ts` or emitter `public/*.events.ts` + bind in `routes/app-providers.svelte` |

**Imports:** cross-module edges use direct `*/public/*` paths — no barrel `index.ts` files. Feature internals (e.g. `catalog.store.ts`) are imported relatively from that feature's `public/` file.

## Styles placement

DMA does not prescribe a styling library — only **where** styles live relative to modules.

| Kind | Put it in… | Example in this repo |
| --- | --- | --- |
| Global reset, typography, `body` | `src/app.css` — imported once from `routes/+layout.svelte` | `src/app.css` |
| Theme tokens (CSS variables) | `routes/app-providers.svelte` — wraps the tree, sets `--color-*` on `.app-theme` | `--color-accent`, `--radius-sm` |
| Route shell layout | Scoped `<style>` in `routes/+page.svelte` | `.page`, `.nav-link` |
| Feature page layout | Scoped `<style>` in `features/*/public/*.svelte` | `catalog-page.svelte` `.catalog` |
| Shared UI primitive | Scoped `<style>` in `shared/ui/*.svelte` | `button.svelte` `.button` |
| Feature-specific shared sheet | Plain `.css` colocated in the feature, imported from `public/` | `checkout/checkout.css` → `checkout-page.svelte` |

**Rules of thumb**

- Prefer **scoped** Svelte `<style>` for component-owned layout and visuals.
- Use **`app.css`** only for truly global base styles (resets, `body`, element defaults).
- Put **design tokens** in the app provider shell so `shared/ui` and features can read `var(--…)` without importing each other.
- A feature may import a colocated `.css` file when several `public/` entrypoints would share the same rules — keep the sheet next to the feature, not in `shared/`.

```text
src/
├── app.css                         # global base — imported in +layout.svelte
├── routes/
│   ├── +layout.svelte              # import "../app.css"
│   ├── +page.svelte                # scoped route shell styles
│   └── app-providers.svelte        # CSS variables on .app-theme
├── features/
│   ├── catalog/public/catalog-page.svelte   # scoped feature styles
│   └── checkout/
│       ├── checkout.css            # feature sheet (optional)
│       └── public/checkout-page.svelte      # import "../checkout.css"
└── shared/ui/button.svelte         # scoped portable UI
```

## Tests placement

Tests are colocated next to the code they exercise — same DMA module, no separate `tests/` tree.

| Code under test | Test file | Runner |
| --- | --- | --- |
| `shared/lib/format-currency.ts` | `shared/lib/format-currency.test.ts` | Vitest (pure `.ts`) |
| `services/cart/public/cart.ts` | `services/cart/public/cart.test.ts` | Vitest + `svelte/store` |
| `features/catalog/catalog.store.ts` | `features/catalog/catalog.store.test.ts` | Vitest + `svelte/store` |

**Rules of thumb**

- Pure helpers and stores → **`.test.ts`** beside the source (no `@testing-library/svelte` needed).
- Svelte components → colocate `*.test.ts` next to the `.svelte` file; add `@testing-library/svelte` only when you need DOM assertions.
- Do not import test files from production code; `dma check` ignores `*.test.ts` / `*.spec.ts`.

```bash
bun run test        # vitest run
```

## Stack

- SvelteKit + Svelte 5 SFCs (`$state`, `$props`, `$effect`, store auto-subscription `$store`)
- Oxlint via `@derived-modular/oxlint-plugin` (`extends` recommended config)

## Commands

From this directory:

```bash
bun run dev         # vite dev
bun run build       # svelte-kit sync && vite build
bun run dma-check   # dma check . (hard architecture gate)
bun run lint        # oxlint .
bun run test        # vitest run
```

From the monorepo root (build CLI/plugins first):

```bash
bun run build
bun run --cwd examples/sveltekit-routes dma-check
bun run --cwd examples/sveltekit-routes lint
bun run --cwd examples/sveltekit-routes test
bun run --cwd examples/sveltekit-routes build
```

## Module graph

```text
routes/+layout.svelte → app-providers.svelte
routes/+page.svelte
  → features/catalog/public/catalog-page.svelte
  → features/checkout/public/checkout-page.svelte
  → features/profile.svelte
  → features/promo.svelte

app-providers.svelte
  → features/checkout/public/checkout.events.ts
  → services/cart/public/cart.ts (clearCart)

catalog-page.svelte
  → features/catalog/catalog.store (relative internal)
  → services/cart/public/cart
  → shared/lib/format-currency
  → shared/ui/{button,card}

checkout-page.svelte
  → features/checkout/checkout.store (relative internal)
  → services/cart/public/cart
  → shared/lib/format-currency
  → shared/ui/{button,card}
```

No barrel `index.ts` files. Import direct file paths only.
