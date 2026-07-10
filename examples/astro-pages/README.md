# Astro pages example

DMA example for **Astro** with layers under `src/` and composition root at `src/pages/`.

Mini-shop domain: `features/catalog`, `features/checkout`, `features/wishlist`, stage-0 `features/profile.astro`, promoted `services/cart` (inbound from catalog + checkout), `shared/ui/button`, `shared/lib/format-currency`.

## Where to put code

| You are building… | Put it in… | Import from pages/features as… |
| --- | --- | --- |
| Route shell, layout, provider wiring | `src/pages/index.astro` (route) + `src/app/` (`layout.astro`, `shop-providers.astro`, `cart-seed.ts`) | Mount `*/public/*` only |
| User-facing flow mounted from pages | `src/features/<name>/public/<entry>.astro` | `@/features/<name>/public/…` |
| Leaf module used once from pages | `src/features/<name>.astro` (stage 0) | `@/features/<name>.astro` |
| Feature-local state (one consumer) | Colocate: `features/<name>/<name>.store.ts` | Relative import from that feature's `public/` file |
| Shared by 2+ features (product scenario) | `src/services/<name>/public/` | `@/services/<name>/public/…` |
| Portable UI / helpers (no product scenario) | `src/shared/ui/`, `src/shared/lib/` | `@/shared/ui/…`, `@/shared/lib/…` |
| Port binding (cycle / external seed) | `src/app/shop-providers.astro` + `src/app/cart-seed.ts` | `provideCartSeed()` before `initCart()` |

### State patterns in this tree

1. **Colocated store** — `catalog.store.ts`, `checkout.store.ts`, `wishlist.store.ts` (feature-private; imported relatively from `public/`).
2. **Promoted service** — `services/cart/public/cart.ts` shared by catalog (`addToCart`) and checkout (`cartTotal`, `cartItemCount`).
3. **Provider port** — `services/cart/public/ports.ts` + `app/shop-providers.astro` binds `demoCartSeed` before features render.

## Composition root (`src/pages/`)

DMA treats `src/pages/` like `app/` — a thin composition root that mounts modules.

```astro
---
import CatalogPage from "@/features/catalog/public/catalog-page.astro";
import ShopProviders from "@/app/shop-providers.astro";
import Layout from "@/app/layout.astro";
---

<Layout title="DMA · Astro mini-shop">
  <ShopProviders>
    <CatalogPage />
  </ShopProviders>
</Layout>
```

Keep only routable files in `src/pages/` (here: `index.astro`). Layout and provider wrappers live in `src/app/` so Astro does not emit extra routes.

- **Downward imports only** from pages: `features/*/public/*`, stage-0 file modules, `services/*/public/*`, `shared/*`.
- **No business logic** in pages — wire layout, providers, and mounts only.
- **Colocated internals** inside a feature (e.g. `checkout.store.ts`) use a **relative path** from that feature's `public/` file so Biome heuristics do not flag cross-module deep imports.

## Provider pattern (Astro)

`shop-providers.astro` in `src/app/` runs before child features: binds `CartSeedPort` in `services/cart/public/ports.ts`, then calls `initCart()`. Real apps might swap the seed for session storage or an API — binding stays in the composition root.

## Imports in frontmatter

Astro runs the `---` block at build time. Use it like a module script:

1. Import DMA public surfaces (`*/public/*`) and stage-0 modules.
2. Call service helpers and read colocated stores before the template.
3. Pass data to child `.astro` components via props when needed.

`dma check` and the Biome plugin parse these imports from `.astro` frontmatter the same way as `.ts` / `.tsx`.

## Where to put styles

| You need… | Put it in… | Example in this tree |
| --- | --- | --- |
| Scoped styles for one `.astro` component | `<style>` at the bottom of the same file (scoped by default) | `catalog/public/catalog-page.astro`, `features/profile.astro` |
| Feature styles shared by multiple files in the module | Colocated `*.css` next to the feature, imported from `public/` | `checkout/checkout-page.css` → `checkout/public/checkout-page.astro` |
| CSS Modules (hashed class names) | `public/*.module.css` + optional `*.classes.ts` helper in the feature | `wishlist/public/wishlist-page.module.css`, `wishlist/wishlist-page.classes.ts` |
| Site-wide tokens, resets, layout shells | `src/styles/global.css` imported once from `app/layout.astro` | `styles/global.css` mounted via `layout.astro` |
| Route-only layout chrome | Class names in `src/pages/index.astro`, rules in global CSS | `.site-header`, `.site-main` in `global.css` |

**Rules of thumb**

- Keep styles **next to the component** that owns the markup; promote to a colocated `.css` file when the sheet grows or is reused inside the same feature.
- Import global CSS only from the composition root (`app/layout.astro` or `pages/`), not from features.
- CSS Modules are optional — use them when you want typed class maps or need to avoid global class collisions without Astro's default scoping.

## Where to put tests

| You are testing… | Put it in… | Runner |
| --- | --- | --- |
| Colocated feature store | `features/<name>/<name>.store.test.ts` | `bun test` |
| Promoted service public API | `services/<name>/public/<api>.test.ts` | `bun test` |
| Portable shared helper | `shared/lib/<helper>.test.ts` | `bun test` |

Colocate `*.test.ts` beside the module under test (same folder as the implementation). Tests import the module with a **relative path** — no `public/` indirection needed for internals.

```bash
bun run test        # bun test (all colocated *.test.ts under src/)
```

This example covers: `catalog.store`, `checkout.store`, `wishlist.store`, `services/cart/public/cart`, and `shared/lib/format-currency`.

## Stack

- Astro 5 (`astro build`)
- Biome via `@derived-modular/biome-plugin` (GritQL rules wired with relative paths in `biome.jsonc`)

## Biome plugin limits

`@derived-modular/biome-plugin` is **best-effort** (GritQL heuristics):

- Understands common `@/` and relative import shapes; no full `tsconfig` path resolution.
- File-scoped rules only — **no import-graph cycles** or inbound-edge promotion signals.
- `.astro` frontmatter is partially covered; `biome.jsonc` disables `noUnusedImports` / `noUnusedVariables` for `*.astro` because Biome does not fully type-check Astro scripts.

**Always run `dma check` in CI** for the hard gate. Use Biome for fast editor/PR feedback, not as a replacement.

## Commands

```bash
bun run build       # astro build
bun run dma-check   # dma check .
bun run lint        # biome check .
bun run test        # bun test
```

From the repo root:

```bash
bun run --cwd examples/astro-pages build
bun run --cwd examples/astro-pages dma-check
bun run --cwd examples/astro-pages lint
bun run --cwd examples/astro-pages test
```
