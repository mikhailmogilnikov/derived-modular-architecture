# @derived-modular/cli

## 1.2.2

### Patch Changes

- Republish with `bun publish` so internal `workspace:*` dependencies resolve to real semver on npm (installs outside this monorepo no longer fail).
- Updated dependencies
  - @derived-modular/boundaries@1.2.2

## 1.2.1

### Patch Changes

- e192ab9: Print a human tip for `check|doctor --suggest|--fix` when fixable diagnostics are present.
  - @derived-modular/boundaries@1.2.1

## 1.2.0

### Minor Changes

- acfa80b: Share barrel-fix helpers in boundaries; CLI bin `dma`; dma.config `thresholds`; promote resolve-verify after rewrite.
- acfa80b: Add `dma check|doctor --suggest|--fix` for safe remediations: no-barrel importer rewrite, public-api path to existing public/, orphan-public delete.
- 574c7f2: Add `dma promote` — dry-run by default; `--apply` moves a folder feature to `services/` with import rewrite, post-check, and snapshot rollback.

### Patch Changes

- 574c7f2: Enrich doctor `help` for `shared-candidate` and `stage-growth` with placement-algorithm next steps (no new rule IDs).
- Updated dependencies [acfa80b]
  - @derived-modular/boundaries@1.2.0

## 1.1.0

### Minor Changes

- f83fa49: Optional `dma.config.*` (`srcRoot`, `compositionRoots`, `roots`, `includePackages`) with upward lookup, `defineConfig`, and `--config`
- a50d377: Add `dma init` — safe bootstrap for layout, `dma.config.ts`, package script, and AGENTS.md (strict skip / append-only)
- 8d479d6: Multi-root monorepo support: discover DMA apps from workspaces (or directory walk), `--roots`, `--include-packages`

### Patch Changes

- @derived-modular/boundaries@1.1.0

## 1.1.0

### Minor Changes

- Optional `dma.config.{ts,mts,mjs,js,json}` (`srcRoot`, `compositionRoots`, `roots`, `includePackages`) with upward lookup and `--config`
- Multi-root monorepo support: discover DMA apps from workspaces (or directory walk), `--roots`, `--include-packages`; each root analyzed as a separate graph

## 1.0.1

### Patch Changes

- Ship compiled dist builds for boundaries and eslint-plugin on npm
- Updated dependencies
  - @derived-modular/boundaries@1.0.1
