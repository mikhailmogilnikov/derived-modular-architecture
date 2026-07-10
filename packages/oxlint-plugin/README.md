# `@derived-modular/oxlint-plugin`

File-scoped DMA rules for Oxlint via [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) (alpha). Wraps [`@derived-modular/eslint-plugin`](../eslint-plugin) — same rule semantics. **Not** a substitute for [`@derived-modular/cli`](../cli) (`dma check`).

Architecture: [DMA spec](../../spec/README.md).

## Install

```bash
npm install -D @derived-modular/oxlint-plugin oxlint
```

Peer: `oxlint >= 1.0.0`.

## Usage

```jsonc
// .oxlintrc.json
{
  "extends": ["./node_modules/@derived-modular/oxlint-plugin/configs/recommended.json"]
}
```

Rules are exposed under the `dma/*` prefix (Oxlint alias), e.g. `dma/no-barrel`.

## Coverage

| Concern | Oxlint | `dma check` |
| --- | --- | --- |
| `layer-direction` | yes | yes |
| `feature-to-feature` | yes | yes |
| `public-api` | yes | yes |
| `no-barrel` | yes | yes |
| `no-cycle` / inbound | no | yes |
| `doctor` signals | no | yes |

## Notes

- JS plugins are still alpha in Oxlint — API may change.
- For Biome-only projects, see [`@derived-modular/biome-plugin`](../biome-plugin) (weaker heuristics).

## Local development

```bash
cd packages/oxlint-plugin
bun test
```

## License

MIT
