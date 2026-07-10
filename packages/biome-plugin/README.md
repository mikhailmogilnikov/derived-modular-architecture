# `@derived-modular/biome-plugin`

Best-effort DMA rules for Biome (GritQL). **Not** a substitute for [`@derived-modular/cli`](../cli) (`dma check`).

Same four concerns as ESLint, but pattern-based — no import resolution, no `@derived-modular/boundaries`. Prefer [`@derived-modular/eslint-plugin`](../eslint-plugin) when you can.

Architecture: [DMA spec](../../spec/README.md).

## Install

```bash
npm install -D @derived-modular/biome-plugin
```

## Usage

```jsonc
{
  "extends": ["@derived-modular/biome-plugin"]
}
```

## Limitations

- Plugin paths resolve from the **project root** (`./node_modules/@derived-modular/biome-plugin/...`) — works with flat `node_modules` (npm/bun); fragile in some monorepo / PnP layouts until Biome improves shared-config plugin resolution.
- Heuristics only: `@/` and relative path patterns, no full tsconfig alias support.
- No graph rules (`no-cycle`, inbound predicates).

## Coverage

| Concern | Biome | ESLint | `dma check` |
| --- | --- | --- | --- |
| `layer-direction` | heuristic | yes | yes |
| `feature-to-feature` | heuristic | yes | yes |
| `public-api` | heuristic | yes | yes |
| `no-barrel` | heuristic | yes | yes |
| `no-cycle` / inbound | no | no | yes |

## Local development

```bash
cd packages/biome-plugin
bun test
```

## License

MIT
