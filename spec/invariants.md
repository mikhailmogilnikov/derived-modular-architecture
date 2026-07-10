# Four invariants

DMA keeps four invariants at every scale — from a pet project to a multi-team monorepo.

| Invariant | MUST | Machine-checkable |
| --- | --- | --- |
| **Downward dependencies** | Layers import only downward: `app → features → services → shared` | Yes (`layer-direction`, inbound predicates, `no-cycle`) |
| **Public API without barrels** | Cross-module imports MUST hit `*/public/*` via direct file paths (stage-0 file modules are entirely public) | Yes (`public-api`, `no-barrel`) |
| **Colocation by default** | Code SHOULD live next to its only consumer until a second use appears | Partial (doctor signals; review for taste) |
| **Second-use rule** | MUST NOT extract “for later”; a second consumer triggers a lift one level up | Partial (`shared-candidate`; promotion via inbound predicates) |

## Normative notes

- Anything that cannot be checked by tooling is a **wish**, not a rule — except the remaining judgment on the `services` / `shared` product boundary (see [layers.md](./layers.md) and [out-of-scope.md](./out-of-scope.md)).
- `import type` counts as a graph edge the same as a value import: a type dependency is still a dependency.

## Reading next

1. [layers.md](./layers.md) — predicates and composition roots  
2. [modules.md](./modules.md) — stages, `public/`, segments  
3. [evolution.md](./evolution.md) — second-use and promotion  
