# Enforcement

Anything that is not machine-checked is a wish and will die. DMA ships a **hybrid** enforcement model: full graph audit in the CLI, file-scoped rules in editors.

## Surfaces

| Surface | Package | Role |
| --- | --- | --- |
| `check` | [`@derived-modular/cli`](../packages/cli) | Hard CI gate — graph rules, inbound predicates, cycles |
| `doctor` | [`@derived-modular/cli`](../packages/cli) | Soft evolution signals (exit 0 by default) |
| `lint` | ESLint / Oxlint / Biome plugins | File-scoped subset for editor feedback |

**Always run `dma check` in CI.** Linter adapters are complementary, not a substitute.

## Concern matrix

| Concern | `dma check` | `dma doctor` | ESLint / Oxlint | Biome |
| --- | --- | --- | --- | --- |
| `layer-direction` | yes | — | yes | heuristic |
| `feature-to-feature` | yes | — | yes | heuristic |
| `public-api` | yes | — | yes | heuristic |
| `no-barrel` | yes | — | yes | heuristic |
| `no-cycle` | yes | — | no | no |
| inbound predicates | yes | — | no | no |
| evolution signals | — | yes | no | no |

Rule catalog (ids, severity, surfaces): [`rules.json`](./rules.json).

## Tooling strategy

Architectural rules are **graph properties**, not single-file properties. The long-term design is one analyzer core (CLI as source of truth) with optional thin linter adapters. File-scoped linters cannot fully replace graph audit (`no-cycle`, inbound predicates, doctor).

Implemented today:

- CLI: full `check` + `doctor`
- ESLint / Oxlint: four file-scoped rules via shared [`@derived-modular/boundaries`](../packages/boundaries)
- Biome: GritQL heuristics for the same four concerns (weaker)

## Illustrations

- Clean layouts: [`examples/`](../examples/)
- Intentional violations (tests only): [`packages/cli/tests/fixtures/`](../packages/cli/tests/fixtures/)

```bash
# published / consumer projects
bun x dma check . --format json
# this monorepo
bun run dma check packages/cli/tests/fixtures/feature-to-feature
bun run dma doctor .
```
