# Derived Modular Architecture — Spec

English **single source of truth** for DMA: rules, concepts, assumptions, and limitations.

Primary consumers: documentation site (future), tooling authors, and the agent skill. Examples and package READMEs are **derivatives** — they illustrate and link here; they MUST NOT redefine rules.

## Authority

When sources conflict, resolve in this order:

1. [`rules.json`](./rules.json) — machine-oriented rule catalog (`id`, severity, surfaces)
2. Chapters in this directory — normative prose
3. Package READMEs, [`examples/`](../examples/), [`skills/dma`](../skills/dma) — operational derivatives

Schema: [`rules.schema.json`](./rules.schema.json).

## What DMA is

Frontend architecture where **rules are derived from the filesystem and import graph**, then enforced by tooling — not taste.

```text
src/
├── app/         # composition root (also: pages/, routes/)
├── features/    # leaf modules
├── services/    # modules with inbound edges (lazy)
└── shared/      # portable ui / lib / api / model / domain
```

## Reading order

1. [invariants.md](./invariants.md) — four invariants  
2. [layers.md](./layers.md) — predicates and composition roots  
3. [modules.md](./modules.md) — stages, `public/`, segments  
4. [shared.md](./shared.md) — shared groups  
5. [evolution.md](./evolution.md) — second-use, promotion, doctor signals  
6. [enforcement.md](./enforcement.md) — check / doctor / linters  
7. [assumptions.md](./assumptions.md) — tooling assumptions  
8. [out-of-scope.md](./out-of-scope.md) — explicit non-goals  

## Chapters

| Doc | Topic |
| --- | --- |
| [invariants.md](./invariants.md) | Four invariants |
| [layers.md](./layers.md) | Layer predicates |
| [modules.md](./modules.md) | Module stages and public API |
| [shared.md](./shared.md) | Shared groups |
| [evolution.md](./evolution.md) | Growth and doctor signals |
| [enforcement.md](./enforcement.md) | Tooling surfaces |
| [assumptions.md](./assumptions.md) | Implemented assumptions |
| [out-of-scope.md](./out-of-scope.md) | Limits |
| [rules.json](./rules.json) | Rule catalog |

## Related

- Examples (clean layouts): [`../examples/`](../examples/)
- Violation fixtures (tests only): [`../packages/cli/tests/fixtures/`](../packages/cli/tests/fixtures/)
- CLI: [`../packages/cli`](../packages/cli)
- Skill: [`../skills/dma`](../skills/dma)
