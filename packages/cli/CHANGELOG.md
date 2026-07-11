# @derived-modular/cli

## 1.1.0

### Minor Changes

- Optional `dma.config.{ts,mts,mjs,js,json}` (`srcRoot`, `compositionRoots`, `roots`, `includePackages`) with upward lookup and `--config`
- Multi-root monorepo support: discover DMA apps from workspaces (or directory walk), `--roots`, `--include-packages`; each root analyzed as a separate graph

## 1.0.1

### Patch Changes

- Ship compiled dist builds for boundaries and eslint-plugin on npm
- Updated dependencies
  - @derived-modular/boundaries@1.0.1
