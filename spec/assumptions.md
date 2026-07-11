# Assumptions

Assumptions baked into current tooling (`@derived-modular/cli` and adapters). Changing them requires tooling work — they are not free configuration in v1.

## Project shape

- **Single application root** with a `src/` directory containing DMA layers.
- **Composition roots** under `src/`: `app`, `pages`, and/or `routes` (defaults).
- Optional `features/`, `services/`, `shared/` as described in [layers.md](./layers.md).
- No first-class multi-root / `domains/*` discovery in v1 tooling (narrative only in [evolution.md](./evolution.md)).

## Path resolution

- Path aliases load from `tsconfig.json` (comments / trailing commas supported; one-level `extends` when local `paths` are empty).
- Common pattern: `@/*` → `src/*`.
- Unresolved / external (npm) imports are ignored by boundary rules.

## Source kinds

Edges are collected from:

- Scripts: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`
- UI: `.vue`, `.svelte`, `.astro`
- Docs components: `.md`, `.mdx`

Edge forms: static `import` / `export … from`, `import type`, dynamic `import()`, `require()` (covers `next/dynamic` / `React.lazy` targets).

## Tooling defaults

- Monorepo roots / layout via `dma.config.*` and CLI flags (`--roots`, `--include-packages`, `srcRoot`, `compositionRoots`).
- Doctor thresholds default to `DEFAULT_THRESHOLDS`; optional overrides via `dma.config` `thresholds`.
- Node.js `>=18` for published packages.

## Authority

When documentation and tooling disagree, **implemented tooling behavior** wins until `spec/` and code are updated together. Prefer fixing the mismatch over inventing undocumented exceptions.
