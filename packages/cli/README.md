# `@derived-modular/cli`

CLI and analyzer for **Derived Modular Architecture (DMA)** — hard boundary checks for CI, plus soft evolution signals for local use.

Architecture: [DMA spec](../../spec/README.md).

Zero-config for a single app root:

```text
src/
├── app/        # composition root (DMA)
├── pages/      # also composition root (Astro / Next pages / …)
├── routes/     # also composition root (TanStack / SvelteKit / …)
├── features/
├── services/   # optional until the first promotion
└── shared/
```

Any of `app/`, `pages/`, and `routes/` under `src/` is a **composition root** (same layer rules as DMA `app/`): may mount modules; does not promote features. Keep route files as thin shells over `*/public/*`.

## Install

```bash
npm install -D @derived-modular/cli
```

Requires Node.js `>=18`.

```bash
npx @derived-modular/cli init
npx @derived-modular/cli check
npx @derived-modular/cli doctor
```

## Commands

```bash
npx @derived-modular/cli init [path]           # scaffold dirs/config/AGENTS (strict skip)
npx @derived-modular/cli check [path]          # hard rules (fails CI on errors)
npx @derived-modular/cli doctor [path]         # evolution signals (exit 0 by default)
npx @derived-modular/cli check --format json
npx @derived-modular/cli doctor --format sarif
npx @derived-modular/cli check .               # multi-root if path has no src/
npx @derived-modular/cli check --roots apps/web,apps/admin
npx @derived-modular/cli check . --include-packages
npx @derived-modular/cli check --config ./dma.config.ts
```

### `init`

Bootstraps a **single** package: missing `src/` layout (`app` unless `pages`/`routes` exist, plus `features`/`shared`), create-if-missing `dma.config.ts`, optional `scripts.dma`, append-only `AGENTS.md` DMA block. Never overwrites existing files. Does not wire linters (prints install hints). In a monorepo, run inside the app package. See docs: tooling → dma init.

Invoke only via the package name — do not rely on a short global binary.

`path` defaults to the current working directory. If `path` contains the configured source root (default `src/`), that single tree is analyzed. If not, the CLI discovers DMA app packages (workspaces first, directory walk fallback). Use `--roots` or `dma.config` `roots` for an explicit list; `--include-packages` / config `includePackages` also includes library packages with layer dirs but no composition root.

Optional project config: `dma.config.ts` | `.mts` | `.mjs` | `.js` | `.json` (upward lookup). Fields: `srcRoot`, `compositionRoots`, `roots`, `includePackages`. See docs: tooling → dma.config. Helper: `defineConfig` from `@derived-modular/cli`.

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | OK — `check` found no errors; `doctor` / `init` return 0 unless the tool itself fails |
| `1` | `check` found architectural errors |
| `2` | Environment failure (missing `src/` for check/doctor, unreadable tree, invalid tsconfig, bad args) |

### Output formats

- `human` (default) — colored TTY diagnostics + summary
- `json` — stable `version: 1` report for CI/agents
- `sarif` — GitHub Code Scanning–friendly SARIF 2.1.0

Disable ANSI colors with `NO_COLOR=1`.

## Linter companions

File-scoped rules in the editor / `lint` script — **not** a full substitute for `npx @derived-modular/cli check`:

| Package | Notes |
| --- | --- |
| [`@derived-modular/eslint-plugin`](../eslint-plugin) | Recommended for ESLint flat config |
| [`@derived-modular/oxlint-plugin`](../oxlint-plugin) | Same rules via Oxlint JS plugins (alpha) |
| [`@derived-modular/biome-plugin`](../biome-plugin) | Best-effort GritQL heuristics |

Graph rules (`no-cycle`, inbound predicates) and `doctor` signals exist only here.

## What `check` enforces

| Rule | Meaning |
| --- | --- |
| `layer-direction` | Imports only downward: `app → features → services → shared` |
| `feature-to-feature` | Features must not import other features |
| `public-api` | Cross-module imports must hit `*/public/*` (stage-0 file modules are entirely public) |
| `no-barrel` | No barrel `index` re-export surfaces inside modules |
| `no-cycle` | No cycles in the module graph |
| `feature-has-inbound` | A feature with inbound module edges must live in `services/` |
| `service-no-inbound` | A service without inbound module edges violates its predicate |

Inbound edges are counted from other **modules** only (`features/*`, `services/*`). Mounts from composition roots (`app/`, `pages/`, `routes/`) do not promote a feature.

## What `doctor` reports

| Signal | Meaning |
| --- | --- |
| `shared-candidate` | A module file is imported by 2+ other modules |
| `stage-growth` | Module structure lags measured size (stage 0 siblings / stage 1 segments) |
| `dense-services` | `services` subgraph looks dense/deep enough to suggest a split |
| `orphan-public` | A `public/` file has no external importers |

`doctor` does **not** re-emit hard `check` rule IDs.

## Supported sources

- Scripts: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`
- UI: `.vue`, `.svelte`, `.astro`
- Docs components: `.md`, `.mdx`
- Edges include static `import` / `export … from`, `import type`, dynamic `import()`, and `require()` (covers `next/dynamic` / `React.lazy` targets)

Path aliases are loaded from `tsconfig.json` (comments / trailing commas supported; one-level `extends` when local `paths` are empty).

Path classification is shared with [`@derived-modular/boundaries`](../boundaries).

## Programmatic API

```ts
import { analyze, DEFAULT_THRESHOLDS } from "@derived-modular/cli";

const { diagnostics, srcRoot } = analyze(process.cwd(), "check");
```

The core never writes to stdout/stderr or calls `process.exit` — that stays in the CLI.

## Local development (this monorepo)

```bash
# from repo root
npx @derived-modular/cli check packages/cli/tests/fixtures/clean
bun run dma:build
node packages/cli/dist/cli.js check .
```

```bash
cd packages/cli
bun test
bun run build
```

## Out of scope

Autofix/codemods (кроме ESLint `no-barrel` import fix), project scaffolding, LSP, `domains/*` layout, cross-package graph merge, watch mode. Biome does not read `dma.config` yet.

## License

MIT
