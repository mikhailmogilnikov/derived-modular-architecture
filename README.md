# Derived Modular Architecture (DMA)

[![CI](https://github.com/mikhailmogilnikov/derived-modular-architecture/actions/workflows/ci.yml/badge.svg)](https://github.com/mikhailmogilnikov/derived-modular-architecture/actions/workflows/ci.yml)
[![npm @derived-modular/cli](https://img.shields.io/npm/v/@derived-modular/cli.svg)](https://www.npmjs.com/package/@derived-modular/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![skills.sh](https://www.skills.sh/b/mikhailmogilnikov/derived-modular-architecture)](https://www.skills.sh/s/mikhailmogilnikov/derived-modular-architecture/dma)

A filesystem-first frontend architecture enforced by tooling — not taste.

DMA tells people and agents where code lives, which imports are allowed, and when to promote a module. The folder tree is the rulebook; the CLI, linters, and CI keep it honest — in single apps and monorepos alike.

**[→ Documentation](https://derived-modular.vercel.app)**

## Quick start

```bash
npm install -D @derived-modular/cli
npx @derived-modular/cli init .
npx @derived-modular/cli check .
```

`init` scaffolds missing `src/` layout, `dma.config.ts`, a `package.json` script, and an `AGENTS.md` block — strict skip, never overwrites. In a monorepo, run inside the app package (e.g. `apps/web`).

Prefer another package manager? Use `pnpm dlx`, `yarn dlx`, or `bunx` the same way.

## Commands

| Command | Description |
| --- | --- |
| `dma init [path]` | Bootstrap layout, config, and agent docs (create-if-missing). |
| `dma check [path]` | Hard rules — graph, cycles, inbound predicates. Fails CI on errors. |
| `dma doctor [path]` | Soft growth signals (exit 0). Hints when to promote or split. |
| `dma promote <module> [--apply]` | Folder feature → `services/` + import rewrite (dry-run default). |

`check` and `doctor` accept an optional path (defaults to cwd). Add `--format json` or `--format sarif` for CI and code scanning.

Common flags:

| Flag | Description |
| --- | --- |
| `--roots <paths>` | Explicit package roots in a monorepo (comma-separated). |
| `--include-packages` | Also analyze library packages with `features` / `services` / `shared`. |
| `--config <file>` | Load `dma.config.*` from a specific path. |

Optional project config: `dma.config.{ts,mts,mjs,js,json}` with `srcRoot`, `compositionRoots`, `roots`, `includePackages`. Helper: `defineConfig` from `@derived-modular/cli`.

Package docs: [`@derived-modular/cli`](./packages/cli/README.md).

## Layout

```text
src/
├── app/         # composition root (also: pages/, routes/)
├── features/    # leaf modules (no inbound edges from other modules)
├── services/    # appears on first promotion — don't create upfront
└── shared/      # portable UI / lib / api / model / domain
```

`pages/` and `routes/` are composition roots too (Astro, TanStack Router, SvelteKit, etc.) — same rules as `app/`.

**Four invariants:** downward imports only · public API without barrels (`*/public/*`) · colocation by default · second-use rule for `shared/`.

Normative spec: [`spec/`](./spec/README.md).

## Key features

### Hybrid enforcement

Full graph audit in the CLI; fast file-scoped feedback in the editor. **Always run `dma check` in CI** — linters are complementary, not a substitute.

| Layer | Package |
| --- | --- |
| CI / full audit | [`@derived-modular/cli`](./packages/cli) |
| Editor / lint | [`@derived-modular/eslint-plugin`](./packages/eslint-plugin) |
| Editor / lint | [`@derived-modular/oxlint-plugin`](./packages/oxlint-plugin) |
| Editor / lint | [`@derived-modular/biome-plugin`](./packages/biome-plugin) |

### Monorepo ready

No `src/` at the repo root? `dma check .` discovers apps (workspaces first, directory walk fallback). Each root is a separate graph — no cross-package merge.

### AI-ready

Install the `dma` agent skill so Cursor, Claude Code, and other hosts follow the same placement rules as the CLI:

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
```

Source: [`skills/dma`](./skills/dma).

## Linter setup

**ESLint** (recommended):

```bash
npm install -D @derived-modular/eslint-plugin eslint
```

```js
import dma from "@derived-modular/eslint-plugin";

export default [
  ...dma.configs.recommended,
  {
    settings: {
      dma: { srcRoot: "src", compositionRoots: ["app", "pages", "routes"] },
    },
  },
];
```

ESLint soft-loads `dma.config.*` when `settings.dma` is unset. Docs: [`eslint-plugin`](./packages/eslint-plugin/README.md) · [`oxlint-plugin`](./packages/oxlint-plugin/README.md) · [`biome-plugin`](./packages/biome-plugin/README.md).

## Examples

Runnable mini-shop trees — each exits 0 on `dma check`:

| Example | Stack | Composition root |
| --- | --- | --- |
| [vite-react](./examples/vite-react) | Vite + React | `src/app/` |
| [next-app](./examples/next-app) | Next App Router | `src/app/` |
| [astro-pages](./examples/astro-pages) | Astro | `src/pages/` |
| [sveltekit-routes](./examples/sveltekit-routes) | SvelteKit | `src/routes/` |
| [vue-vite](./examples/vue-vite) | Vue + Vite | `src/app/` |

Tour: [examples/README.md](./examples/README.md).

## Documentation

- **Website:** [derived-modular.vercel.app](https://derived-modular.vercel.app)
- **Spec (normative):** [`spec/`](./spec/README.md)
- **Docs site source:** [`apps/docs`](./apps/docs)
- **Issues:** [github.com/mikhailmogilnikov/derived-modular-architecture/issues](https://github.com/mikhailmogilnikov/derived-modular-architecture/issues)

## License

MIT © [Mikhail Mogilnikov](./LICENSE)

## Contributing

[CONTRIBUTING.md](./CONTRIBUTING.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security](./SECURITY.md)
