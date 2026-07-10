# Contributing

Thanks for your interest in Derived Modular Architecture (DMA).

## Development setup

```bash
git clone https://github.com/mikhailmogilnikov/derived-modular-architecture.git
cd derived-modular-architecture
bun install
bun run dma check packages/cli/tests/fixtures/clean
```

Requires [Bun](https://bun.sh) `1.3.x` (see `packageManager` in root `package.json`).

## Workflow

1. Fork and create a branch from `main`.
2. Make changes; keep PRs focused.
3. Run checks locally:

```bash
bun x ultracite fix
bun test --cwd packages/boundaries
bun test --cwd packages/cli
bun test --cwd packages/eslint-plugin
bun test --cwd packages/biome-plugin
bun test --cwd packages/oxlint-plugin
```

4. Commit with [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, …). `commitlint` runs on `commit-msg` via lefthook.

## Changesets

User-facing package changes need a changeset:

```bash
bun run changeset
```

Pick affected `@derived-modular/*` packages and the semver bump. Commit the generated file under `.changeset/`.

Maintainers run `bun run version-packages` and `bun run release` when publishing.

## Pull requests

- Link related issues when applicable.
- Update README / package README if behavior or public API changes.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
