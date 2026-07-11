# Out of scope

Honest boundaries of the DMA **specification** and of **v1 tooling**.

## Specification does not decide

- **Domain cutting** — whether cart and checkout are one module or two is product modeling (Conway). DMA can *detect* bad cuts after the fact (many ports, dense subgraph); detection is not a recipe.
- **State management / data flow** — Flux, signals, server cache: DMA says *where* state lives (`model/`), not *how* it works.
- **Test pyramid** — placement is specified (colocation); coverage strategy is a team choice.
- **Service API lifecycle** — full semver windows between teams; only direction (packages + exports) is sketched at stage 4.
- **Runtime boundaries** — microfrontends, module federation, independent deploys.
- **Framework rendering** — SSR/RSC/file routing details; principle: framework route files are thin shells in the composition root.

## Remaining human judgment

- **Product scenario vs portable infra** on the `services` / `shared` boundary — last non-machine rule (see [layers.md](./layers.md)).

## Tooling v1 does not include

- Autofix / codemods / promotion automation
- Project scaffolding
- LSP / architecture server
- Watch mode
- Doctor thresholds / rule allowlists in config (layout + monorepo `roots` are supported via `dma.config.*`; doctor `thresholds` overrides are supported)
- `domains/*` roots and cross-package graph merge
- Biome/Oxlint parity with full graph rules
- Runtime loading of [`rules.json`](./rules.json) inside the CLI
- Linter plugins reading full `dma.config.*` in Biome (ESLint/Oxlint read layout fields)

## Declarations

Executable overrides (e.g. temporary allowlists) are the only allowed “manifests”. Declarations that merely restate what the filesystem already shows are forbidden documentation theater.

See also CLI package “Out of scope (v1)” in [`packages/cli/README.md`](../packages/cli/README.md).
