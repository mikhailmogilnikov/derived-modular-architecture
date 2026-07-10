# Derived Modular Architecture (DMA)

Frontend architecture where **rules are derived from the filesystem and import graph**, then enforced by tooling — not taste.

```text
src/
├── app/         # composition root (also: pages/, routes/)
├── features/    # leaf modules (no inbound edges from other modules)
├── services/    # modules with inbound edges (created on first promotion)
└── shared/      # portable UI / lib / api / model / domain
```

`pages/` and `routes/` under `src/` are treated as composition roots (same rules as `app/`) for Astro, TanStack Router, SvelteKit, etc.

## Spec

Full synthesis: [docs/derived-modular.md](./docs/derived-modular.md)

**Four invariants**

1. Downward imports only: `app → features → services → shared`
2. Public API without barrels — cross-module imports hit `*/public/*` (direct file paths)
3. Colocation by default
4. Second-use rule — lift only when a second consumer appears

## Enforcement (hybrid)

| Layer | Package | Role |
| --- | --- | --- |
| CI / full audit | [`@derived-modular/cli`](./packages/cli) | `dma check` + `dma doctor` — graph rules, inbound predicates, cycles |
| Editor / lint | [`@derived-modular/eslint-plugin`](./packages/eslint-plugin) | Four file-scoped rules (strongest) |
| Editor / lint | [`@derived-modular/oxlint-plugin`](./packages/oxlint-plugin) | Same rules via Oxlint JS plugins (alpha) |
| Editor / lint | [`@derived-modular/biome-plugin`](./packages/biome-plugin) | Same four concerns, GritQL heuristics (weaker) |
| Shared logic | [`@derived-modular/boundaries`](./packages/boundaries) | Path classifier used by CLI + ESLint |

**Always run `dma check` in CI.** Linter adapters are complementary, not a substitute.

## CLI — `@derived-modular/cli`

```bash
npm install -D @derived-modular/cli
npx @derived-modular/cli check
npx @derived-modular/cli doctor --format json
```

Docs: [packages/cli/README.md](./packages/cli/README.md)

From this monorepo:

```bash
bun run dma check .
bun run dma:build
bun run --cwd packages/cli test
```

## ESLint — `@derived-modular/eslint-plugin`

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

Docs: [packages/eslint-plugin/README.md](./packages/eslint-plugin/README.md)

## Biome — `@derived-modular/biome-plugin`

```bash
npm install -D @derived-modular/biome-plugin
```

```jsonc
{
  "extends": ["@derived-modular/biome-plugin"]
}
```

Docs: [packages/biome-plugin/README.md](./packages/biome-plugin/README.md)

## Oxlint — `@derived-modular/oxlint-plugin`

```bash
npm install -D @derived-modular/oxlint-plugin oxlint
```

```jsonc
{
  "extends": ["./node_modules/@derived-modular/oxlint-plugin/configs/recommended.json"]
}
```

Docs: [packages/oxlint-plugin/README.md](./packages/oxlint-plugin/README.md)

## Agent skill

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
```

Source: [skills/dma](./skills/dma) · [skills/README.md](./skills/README.md)

## Repository layout

| Path | npm package |
| --- | --- |
| `packages/cli` | `@derived-modular/cli` |
| `packages/boundaries` | `@derived-modular/boundaries` |
| `packages/eslint-plugin` | `@derived-modular/eslint-plugin` |
| `packages/biome-plugin` | `@derived-modular/biome-plugin` |
| `packages/oxlint-plugin` | `@derived-modular/oxlint-plugin` |
| `skills/dma` | installable agent skill |
| `docs/` | architecture synthesis + design notes |
| `apps/` | (reserved) example apps |

## License

MIT
