# DMA examples

Copy-paste **clean** trees that demonstrate [Derived Modular Architecture](../docs/derived-modular.md) across frameworks. Every example exits 0 on `dma check .` — violations live in [`packages/cli/tests/fixtures`](../packages/cli/tests/fixtures), not here.

## Four invariants

1. **Downward imports only** — `app → features → services → shared`
2. **Public API without barrels** — cross-module imports hit `*/public/*` (or a stage-0 file module in full)
3. **Colocation by default** — code stays next to its only consumer until second use
4. **Second-use rule** — promote to `services/` or `shared/` only when a second module needs the same code

## Shared mini-shop story

All five examples tell the same product story with different framework shells:

1. **Catalog** — browse products, filter locally, add items to cart
2. **Checkout** — read cart totals from the promoted cart service
3. **Profile** — stage-0 self-contained card
4. **Cart service** — inbound from catalog + checkout (promotion already applied)
5. **App / pages / routes** — thin composition root; wires cross-feature events via props/providers, never `feature → feature`

```text
composition root ──mount──► features/checkout/public/*
composition root ──mount──► features/profile (stage-0)
features/checkout ──► services/cart/public/*
features/catalog  ──► services/cart/public/*
features/checkout ──► shared/ui/button
```

## Module stages ladder

DMA modules **grow in place** — you do not pre-create empty `services/` or `shared/` folders. The five examples show the same promotion path with real files:

| Stage | Shape | When | See in examples |
| --- | --- | --- | --- |
| **0 — file module** | Single file at `features/<name>.tsx` (entire file is public) | Self-contained screen, no internal split yet | [vite-react `profile.tsx`](./vite-react/src/features/profile.tsx), [next-app `profile.tsx`](./next-app/src/features/profile.tsx), [vue-vite `profile.vue`](./vue-vite/src/features/profile.vue), [sveltekit `profile.svelte`](./sveltekit-routes/src/features/profile.svelte), [astro `profile.astro`](./astro-pages/src/features/profile.astro) |
| **1 — dir module** | `features/<name>/` with `public/` entry + colocated internals | Flow grows: store, API, styles beside the screen | [vite-react `checkout/`](./vite-react/src/features/checkout/), [next-app `catalog/`](./next-app/src/features/catalog/), [astro `wishlist/`](./astro-pages/src/features/wishlist/) |
| **→ services/** | `services/<name>/public/*` | **Second consumer** — 2+ modules import the same product scenario | [vite-react `cart`](./vite-react/src/services/cart/public/cart.ts) ← catalog + checkout; [next-app `cart`](./next-app/src/services/cart/public/cart.ts) ← catalog + checkout |
| **→ shared/** | `shared/lib/`, `shared/ui/`, `shared/model/` | Portable helper or primitive with **no product meaning**, used by 2+ modules | [vite-react `format-currency.ts`](./vite-react/src/shared/lib/format-currency.ts) — catalog, checkout, notifications; [next-app `button.tsx`](./next-app/src/shared/ui/button.tsx) — every feature |

```text
Stage 0                    Stage 1                         Promotion
────────                   ───────                         ─────────
features/profile.tsx  →   features/checkout/              services/cart/public/
  (one file = public)       public/checkout-page.tsx        (catalog + checkout import)
                            checkout.store.ts (internal)
                                                          shared/lib/format-currency.ts
                                                            (2+ modules, no product logic)
```

**Colocation rule:** `checkout.store.ts` stays inside `features/checkout/` because only checkout reads shipping state. Cart moved to `services/cart/` because **catalog also calls `addToCart`** — inbound edges from two modules trigger the `services/` layer.

See [vite-react README — Module evolution](./vite-react/README.md#module-evolution-checkout--cart) for the checkout → cart story with file references.

## Examples at a glance

| Example | Stack | Composition root | Lint adapter | Runnable | README |
| --- | --- | --- | --- | --- | --- |
| [vite-react](./vite-react) | Vite + React 19 | `src/app/` | `@derived-modular/eslint-plugin` | yes | [README](./vite-react/README.md) |
| [next-app](./next-app) | Next App Router (skeleton) | `src/app/` | `@derived-modular/eslint-plugin` | no (v1) | [README](./next-app/README.md) |
| [astro-pages](./astro-pages) | Astro | `src/pages/` | `@derived-modular/biome-plugin` | yes (`build`) | [README](./astro-pages/README.md) |
| [sveltekit-routes](./sveltekit-routes) | SvelteKit + Svelte 5 | `src/routes/` | `@derived-modular/oxlint-plugin` | yes (`build`) | [README](./sveltekit-routes/README.md) |
| [vue-vite](./vue-vite) | Vue 3 + Vite | `src/app/` | `@derived-modular/biome-plugin` | yes | [README](./vue-vite/README.md) |

**Start here:** [vite-react](./vite-react) — runnable canon with catalog, checkout, notifications, colocated stores, tests, and a data-fetching pattern.

## Where to put X

| You have… | Put it in… | Notes |
| --- | --- | --- |
| Route shell, layout, providers | Composition root (`app/`, `pages/`, `routes/`) | Thin mounts only — import `*/public/*` |
| User-facing screen / flow | `features/<name>/public/` or stage-0 `features/<name>.*` | Leaf modules; no inbound from other features |
| State for one feature only | Colocated `*.store.ts` inside that feature | Relative import from `public/` |
| Logic reused by 2+ modules (product) | `services/<name>/public/` | Inbound edges → `services/` layer |
| Portable UI / pure helpers / HTTP | `shared/ui/`, `shared/lib/`, `shared/model/` | No product scenarios; bottom layer |
| Feature-specific API calls | `features/<name>/<name>.api.ts` | Internal until second consumer needs it |
| Cross-module wiring / events | Composition root | Props, providers, ports — no `feature → feature` |
| Colocated unit tests | Beside the file under test (`*.test.ts`) | See vite-react for Vitest pattern |
| Global / shell styles | `app/app.css` or framework layout | Features own their scoped styles |
| E2E tests (not shown) | App root (`e2e/`, Playwright config) | Exercises routes across modules |

### What must NOT go in `shared/`

- Feature-specific flows, filters, or skins
- Product state (cart, session) — belongs in `services/`
- Imports from `features/` or `services/`
- Barrel `index.ts` re-exports

## Composition roots

DMA treats these folders under `src/` as composition roots (same rules as `app/`):

| Framework | Root folder | Example |
| --- | --- | --- |
| Vite React, Vue | `src/app/` | [vite-react/src/app](./vite-react/src/app), [vue-vite/src/app](./vue-vite/src/app) |
| Next App Router | `src/app/` | [next-app/src/app](./next-app/src/app) |
| Astro | `src/pages/` | [astro-pages/src/pages](./astro-pages/src/pages) |
| SvelteKit | `src/routes/` | [sveltekit-routes/src/routes](./sveltekit-routes/src/routes) |

Configure linters with `compositionRoots: ["app", "pages", "routes"]` and `srcRoot: "src"`.

## Style index (cookbook)

DMA cares about **colocation** and **layer boundaries**, not a single styling technology. Use this table to find a real file for each approach:

| Style | See in example | Path |
| --- | --- | --- |
| **Global CSS** (resets, shell tokens) | vite-react | [`src/app/app.css`](./vite-react/src/app/app.css) |
| | vue-vite | [`src/app/app.css`](./vue-vite/src/app/app.css) |
| | sveltekit-routes | [`src/app.css`](./sveltekit-routes/src/app.css) |
| | astro-pages | [`src/styles/global.css`](./astro-pages/src/styles/global.css) |
| | next-app | [`src/app/globals.scss`](./next-app/src/app/globals.scss) |
| **CSS Modules** (hashed classes) | vite-react (feature) | [`catalog-page.module.css`](./vite-react/src/features/catalog/public/catalog-page.module.css) |
| | vite-react (shared UI) | [`button.module.css`](./vite-react/src/shared/ui/button.module.css) |
| | vue-vite | [`catalog-page.module.css`](./vue-vite/src/features/catalog/public/catalog-page.module.css) |
| | astro-pages | [`wishlist-page.module.css`](./astro-pages/src/features/wishlist/public/wishlist-page.module.css) |
| | next-app | [`checkout-page.module.css`](./next-app/src/features/checkout/public/checkout-page.module.css) |
| **SCSS module** | vite-react (stage-0) | [`profile.module.scss`](./vite-react/src/features/profile.module.scss) |
| | next-app (feature) | [`catalog-page.module.scss`](./next-app/src/features/catalog/public/catalog-page.module.scss) |
| **Plain colocated CSS** (no modules) | vite-react | [`checkout-page.css`](./vite-react/src/features/checkout/public/checkout-page.css) |
| | astro-pages | [`checkout-page.css`](./astro-pages/src/features/checkout/checkout-page.css) |
| | sveltekit-routes | [`checkout.css`](./sveltekit-routes/src/features/checkout/checkout.css) |
| **CSS-in-JS** (style objects) | vite-react | [`notifications.styles.ts`](./vite-react/src/features/notifications/notifications.styles.ts) |
| **Vue `<style scoped>`** (composition root) | vue-vite | [`App.vue`](./vue-vite/src/app/App.vue) (shell nav) |
| **Vue `<style scoped>`** (feature) | vue-vite | [`checkout-page.vue`](./vue-vite/src/features/checkout/public/checkout-page.vue) |
| **Vue `<style module>`** (CSS Modules in SFC) | vue-vite | [`catalog-page.vue`](./vue-vite/src/features/catalog/public/catalog-page.vue) |
| **Vue `<style lang="scss" scoped>`** | vue-vite | [`profile.vue`](./vue-vite/src/features/profile.vue) |
| **Svelte `<style>`** (scoped by default) | sveltekit-routes | [`catalog-page.svelte`](./sveltekit-routes/src/features/catalog/public/catalog-page.svelte) |
| **Astro `<style>`** (scoped by default) | astro-pages | [`profile.astro`](./astro-pages/src/features/profile.astro) |

Rule of thumb: **globals in the composition root**, **feature skins colocated with the owning `public/` entry**, **shared UI modules next to primitives** — never style barrels.

## Violations tour

Clean examples pass `dma check .`. To **see what breaks** and how to fix it, use the CLI test fixtures under [`packages/cli/tests/fixtures`](../packages/cli/tests/fixtures) — do not copy them into `examples/`.

| Violation | Fixture | What breaks | How to fix |
| --- | --- | --- | --- |
| **feature → feature** | [`feature-to-feature`](../packages/cli/tests/fixtures/feature-to-feature) | `features/a.tsx` imports `features/b` — modules must be leaves | Wire through the composition root (props, providers, events). Import only `*/public/*` downward from `app/` |
| **barrel re-export** | [`barrel`](../packages/cli/tests/fixtures/barrel) | `features/widget/index.ts` re-exports `public/widget` | Delete the barrel; import the direct file path (`features/widget/public/widget`) |
| **deep import / public API** | [`deep-import`](../packages/cli/tests/fixtures/deep-import) | `features/a/public/a.ts` reaches into `services/cart/cart.store` (internal) | Import only from `services/cart/public/*`; keep internals relative inside the owning module |
| **layer violation** | [`layer-violation`](../packages/cli/tests/fixtures/layer-violation) | `shared/lib/x.ts` imports `features/profile` — upward import | Move shared code down: `shared/` must not depend on `features/` or `services/` |

Run from the monorepo root (build CLI first):

```bash
bun run build
bun run dma check packages/cli/tests/fixtures/feature-to-feature
bun run dma check packages/cli/tests/fixtures/barrel
bun run dma check packages/cli/tests/fixtures/deep-import
bun run dma check packages/cli/tests/fixtures/layer-violation
```

Other fixtures (`cycle`, `dense-services`, `inbound-feature`, `service-no-inbound`, `shared-candidate`, `stage-growth-0`, `stage-growth-1`) cover cycles, inbound predicates, and stage growth — explore the same way.

## Tooling matrix

| Tool | Role | Used in |
| --- | --- | --- |
| `dma check` (`@derived-modular/cli`) | **Hard gate** — graph rules, cycles, inbound predicates | All examples (`dma-check` script) |
| `@derived-modular/eslint-plugin` | File-scoped rules in ESLint flat config | vite-react, next-app |
| `@derived-modular/biome-plugin` | GritQL heuristics via Biome `extends` | astro-pages, vue-vite |
| `@derived-modular/oxlint-plugin` | Same rules via Oxlint JS plugins | sveltekit-routes |

**Always run `dma check` in CI.** Linter adapters are complementary, not a substitute.

## What's NOT covered

These examples intentionally omit:

- **Violation demos in `examples/`** — see [Violations tour](#violations-tour) and [`packages/cli/tests/fixtures`](../packages/cli/tests/fixtures)
- **Server actions / full Next dev server in CI** — [next-app](./next-app) shows the RSC boundary in source; not runnable in v1
- **Monorepo `domains/*` roots** — single-package `src/` layout
- **Autofix / scaffolding CLI** — manual copy-paste for now
- **Full framework dev servers in CI** for every skeleton (next-app is source-only in v1)

## Verify from monorepo root

Build packages first, then check all examples:

```bash
bun install
bun run build
bun x ultracite check
bun run dma-check:examples
turbo run lint --filter="./examples/*"
turbo run test --filter="./examples/*"
turbo run build --filter="./examples/vite-react" --filter="./examples/vue-vite" --filter="./examples/sveltekit-routes" --filter="./examples/astro-pages"
```

Per-example commands are documented in each example README.
