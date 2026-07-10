# `@dma/cli`

CLI and analyzer for **Derived Modular Architecture (DMA)** — hard boundary checks for CI, plus soft evolution signals for local use.

Zero-config for a single app root:

```text
src/
├── app/
├── features/
├── services/   # optional until the first promotion
└── shared/
```

## Install

```bash
npm install -D @dma/cli
# or
pnpm add -D @dma/cli
# or
bun add -d @dma/cli
```

Requires Node.js `>=18`. After publish you can also run without installing:

```bash
npx @dma/cli check
bunx @dma/cli doctor
```

## Commands

```bash
dma check [path]                 # hard rules (fails CI on errors)
dma doctor [path]                # evolution signals (exit 0 by default)
dma check --format json
dma doctor --format sarif
```

`path` defaults to the current working directory. DMA looks for `src/{app,features,services?,shared}`.

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | OK — `check` found no errors; `doctor` always returns 0 unless the tool itself fails |
| `1` | `check` found architectural errors |
| `2` | Environment failure (missing `src/`, unreadable tree, invalid tsconfig, bad args) |

### Output formats

- `human` (default) — colored TTY diagnostics + summary
- `json` — stable `version: 1` report for CI/agents
- `sarif` — GitHub Code Scanning–friendly SARIF 2.1.0

Disable ANSI colors with `NO_COLOR=1`.

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

Inbound edges are counted from other **modules** only (`features/*`, `services/*`). Mounts from `app/` do not promote a feature.

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

## Programmatic API

```ts
import { analyze, DEFAULT_THRESHOLDS } from "@dma/cli";

const { diagnostics, srcRoot } = analyze(process.cwd(), "check");
```

The core never writes to stdout/stderr or calls `process.exit` — that stays in the CLI.

## Local development (this monorepo)

```bash
# from repo root
bun run dma check packages/dma/tests/fixtures/clean
bun run dma:build
node packages/dma/dist/cli.js check .
```

```bash
cd packages/dma
bun test
bun run build
```

## Out of scope (v1)

Autofix/codemods, project scaffolding, LSP, monorepo / `domains/*` roots, config files, ESLint/Biome adapters, watch mode.

## License

MIT
