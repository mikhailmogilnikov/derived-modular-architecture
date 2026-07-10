# @derived-modular/docs

Documentation site for Derived Modular Architecture — Next.js + Fumadocs.

```bash
# from monorepo root
bun run dev:docs

# or from this directory
bun run dev
```

Open http://localhost:3000/docs

## DMA layout

```text
src/
├── app/                 # composition root (Next.js App Router)
├── features/
│   ├── home/public/
│   └── docs-page/public/
├── services/
│   └── docs-content/public/
└── shared/
    ├── model/
    └── ui/
```

Content: `content/docs/`. Normative spec: [`spec/`](../../spec/).

```bash
bun run dma-check
```
