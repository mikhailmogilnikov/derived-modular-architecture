# Derived Modular Architecture (DMA)

Frontend architecture where **rules are derived from the filesystem and import graph**, then enforced by tooling — not taste.

```text
src/
├── app/         # composition root
├── features/    # leaf modules (no inbound edges from other modules)
├── services/    # modules with inbound edges (created on first promotion)
└── shared/      # portable UI / lib / api / model / domain
```

## Spec

Full synthesis: [docs/derived-modular.md](./docs/derived-modular.md)

**Four invariants**

1. Downward imports only: `app → features → services → shared`
2. Public API without barrels — cross-module imports hit `*/public/*` (direct file paths)
3. Colocation by default
4. Second-use rule — lift only when a second consumer appears

## CLI — `@dma/cli`

Hard CI checks + soft evolution signals. Package docs: [packages/dma/README.md](./packages/dma/README.md)

```bash
# install
npm install -D @dma/cli

# check architecture (exit 1 on errors)
npx @dma/cli check
npx @dma/cli doctor --format json
```

From this monorepo:

```bash
bun run dma check .
bun run dma:build
bun run --cwd packages/dma test
```

## Agent skill

Install via [skills.sh](https://skills.sh/):

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
```

Source: [skills/dma](./skills/dma)

## Repository layout

| Path | Role |
| --- | --- |
| `docs/` | Architecture synthesis + design notes |
| `packages/dma` | `@dma/cli` analyzer and CLI |
| `skills/dma` | Installable agent skill |
| `apps/` | (reserved) example / playground apps |

## License

MIT
