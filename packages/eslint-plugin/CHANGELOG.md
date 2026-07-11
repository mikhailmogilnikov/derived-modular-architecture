# @derived-modular/eslint-plugin

## 1.1.0

### Minor Changes

- `no-barrel` autofix for imports that resolve to a single-target barrel (rewrite to public path)
- Read `srcRoot` / `compositionRoots` from upward `dma.config.*` (settings.dma still wins)

## 1.0.1

### Patch Changes

- Ship compiled dist builds for boundaries and eslint-plugin on npm
- Updated dependencies
  - @derived-modular/boundaries@1.0.1
