# `@derived-modular/boundaries`

Pure path classifiers for [Derived Modular Architecture](https://github.com/mikhailmogilnikov/derived-modular-architecture). No filesystem graph, no ESLint — shared by `@derived-modular/cli` and `@derived-modular/eslint-plugin`.

Architecture: [DMA spec](../../spec/README.md).

## Install

Usually pulled in as a dependency. For custom tooling:

```bash
npm install @derived-modular/boundaries
```

## API (high level)

```ts
import {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  LAYER_RANK,
  isBarrelIndexFilename,
  isPublicImportTarget,
  layerOfPath,
  moduleRefOfPath,
} from "@derived-modular/boundaries";
```

`PathContext`: `{ srcRoot, compositionRootDirnames }` — defaults match DMA (`src`, `["app","pages","routes"]`).

## What it classifies

- Structural layer: `app` | `features` | `services` | `shared` (composition roots = `app`)
- Module id + layer for `features/*` and `services/*` (stage-0 file modules vs directory modules)
- Public vs deep import target (`*/public/*`, stage-0 files)
- Barrel `index.ts` / `index.tsx` candidates

## Local development

```bash
cd packages/boundaries
bun test
bun run check-types
```

## License

MIT
