# `@derived-modular/eslint-plugin`

File-scoped [Derived Modular Architecture](https://github.com/mikhailmogilnikov/derived-modular-architecture) rules for ESLint flat config.

Uses [`@derived-modular/boundaries`](../boundaries) for path classification. **Not** a substitute for [`@derived-modular/cli`](../cli) (`dma check`) — graph rules and `doctor` stay in the CLI.

Architecture: [DMA spec](../../spec/README.md).

## Install

```bash
npm install -D @derived-modular/eslint-plugin eslint
```

Requires ESLint `>=9` (flat config).

## Usage

```js
import dma from "@derived-modular/eslint-plugin";

export default [
  ...dma.configs.recommended,
  {
    settings: {
      dma: {
        srcRoot: "src",
        compositionRoots: ["app", "pages", "routes"],
      },
    },
  },
];
```

## Rules (`recommended` = all `error`)

| Rule | Meaning |
| --- | --- |
| `@derived-modular/layer-direction` | Downward imports only (`pages`/`routes` = `app`) |
| `@derived-modular/feature-to-feature` | Features must not import other features |
| `@derived-modular/public-api` | Cross-module imports must hit `*/public/*` |
| `@derived-modular/no-barrel` | No barrel `index` re-exports inside modules |

## Coverage vs CLI

| Concern | ESLint / Oxlint | Biome | `dma check` |
| --- | --- | --- | --- |
| `layer-direction` | yes | heuristic | yes |
| `feature-to-feature` | yes | heuristic | yes |
| `public-api` | yes | heuristic | yes |
| `no-barrel` | yes | heuristic | yes |
| `no-cycle` | no | no | yes |
| inbound predicates | no | no | yes |
| `doctor` signals | no | no | yes |

## Settings (`settings.dma`)

| Key | Default |
| --- | --- |
| `srcRoot` | `"src"` (or from `dma.config.*`) |
| `compositionRoots` | `["app", "pages", "routes"]` (or from `dma.config.*`) |

Precedence: `settings.dma` **>** upward `dma.config.{ts,mts,mjs,js,json}` **>** defaults. Only `srcRoot` / `compositionRoots` are read from the file (`roots` / `includePackages` are CLI-only).

Resolves relative imports and `@/` → `srcRoot`. Other tsconfig path aliases need a host resolver; bare npm packages are ignored.

### Autofix

`@derived-modular/no-barrel` can autofix **imports** that resolve to a module barrel when the barrel has a single `export … from` target (rewrite to that public path). The barrel file itself is still reported without an autofix.

## Oxlint

Same plugin loads via [`@derived-modular/oxlint-plugin`](../oxlint-plugin) (`jsPlugins`).

## Local development

```bash
cd packages/eslint-plugin
bun test
bun run check-types
```

## License

MIT
