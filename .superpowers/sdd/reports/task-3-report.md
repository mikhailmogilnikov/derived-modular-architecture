# Task 3 Report: Tsconfig paths + import parse + resolve

**Status:** DONE_WITH_CONCERNS  
**Branch:** `feat/dma-cli-v1`  
**Commit:** `54508c9` — `feat(dma): parse and resolve TypeScript imports`  
**Date:** 2026-07-10

## Summary

Pinned `@dma/cli` to `typescript@5.9.3` (Bun-safe sync API). Implemented `loadPathAliases`, `parseImports` (classic `ts.createSourceFile`), and `resolveImport` (relative + longest alias prefix; bare/unresolved → `null`). TDD: existing failing resolve test → implement → pass → commit.

## Steps executed

1. **Failing test** — kept/adapted `tests/unit/resolve.test.ts` from interrupted attempt; `bun test` failed with missing `parse-imports` module.
2. **Dependency** — set `packages/dma/package.json` `"typescript": "5.9.3"`; `bun install` from repo root updated `bun.lock`.
3. **Implement** — created `tsconfig-paths.ts`, `parse-imports.ts`, `resolve.ts`; extended `DmaEnvironmentError` with optional `cause` for Ultracite `useErrorCause`.
4. **Pass** — resolve tests PASS (2); full package suite PASS (5); `tsc --noEmit` PASS; Ultracite PASS.
5. **Commit** — `54508c9` (pre-commit Ultracite clean).

## Files created / modified

| Path | Action |
|------|--------|
| `packages/dma/package.json` | Modified — `typescript` `7.0.2` → `5.9.3` |
| `bun.lock` | Modified — lockfile for TS 5.9.3 |
| `packages/dma/src/core/tsconfig-paths.ts` | Created |
| `packages/dma/src/core/parse-imports.ts` | Created |
| `packages/dma/src/core/resolve.ts` | Created |
| `packages/dma/src/core/errors.ts` | Modified — optional `ErrorOptions` / `cause` |
| `packages/dma/tests/unit/resolve.test.ts` | Created (kept from prior attempt) |

## Interfaces produced

- `PathAlias` (`interface`: `{ prefix, baseDir }`)
- `loadPathAliases(projectRoot): PathAlias[]` — reads `tsconfig.json` + one `extends` level; missing file → `[]`; invalid JSON → `DmaEnvironmentError`
- `parseImports(filePath, sourceText): ImportSpec[]` — `import`/`export … from`; `import type` → `isTypeOnly: true`
- `resolveImport(fromFile, specifier, aliases, projectRoot): string | null` — relative + alias extension dance; bare/unresolved → `null`

## Test results

```
bun test tests/unit/resolve.test.ts
(pass) resolve > resolves @/ alias and relative imports
(pass) resolve > parseImports treats import type as type-only
2 pass, 0 fail

bun test  (package)
5 pass, 0 fail

bun run check-types
PASS
```

## Self-review

- [x] `typescript@5.9.3` only — no `@typescript/typescript6`, no `typescript/unstable/*`
- [x] Classic `import ts from "typescript"` + `ts.createSourceFile`
- [x] Core does not write stdout/stderr or call `process.exit`
- [x] `import type` → `isTypeOnly: true`
- [x] Unresolved / bare package imports → `null`
- [x] No graph/classify/rules
- [x] Commit includes `package.json` + `bun.lock`
- [x] Pre-commit Ultracite satisfied
- [x] No secrets committed

## Deviations from brief (concerns)

1. **`PathAlias` is `interface`, not `type`**  
   Ultracite `useConsistentTypeDefinitions` (same as Tasks 1–2). Shape unchanged; fields alphabetized (`baseDir`, `prefix`).

2. **`DmaEnvironmentError` accepts optional `cause`**  
   Required for Ultracite `useErrorCause` when wrapping JSON parse failures. Backward-compatible.

3. **`_projectRoot` unused in `resolveImport`**  
   Signature kept per brief for future callers; resolution uses `fromFile` + aliases only.

4. **`extends` only applied when local `paths` empty**  
   Brief: “one level of extends if present.” Current behavior merges only when the root config has no paths — sufficient for typical base-tsconfig setups; does not deep-merge path maps.

## Review fix: directory → index resolution

**Date:** 2026-07-10  
**Finding:** Critical — `tryResolvePath` returned an existing directory path instead of resolving to `index.*`.

### Fix

- `tryResolvePath` now only returns **files** (`statSync(...).isFile()`).
- Order: extension candidates → bare file → `index.ts` / `index.tsx` / `index.js` / `index.jsx` inside the directory.
- Never returns a directory path as a resolved module file.

### Test evidence

```
cd packages/dma && bun test tests/unit/resolve.test.ts
(pass) resolve > resolves @/ alias and relative imports
(pass) resolve > resolves directory specifier to index.ts
(pass) resolve > parseImports treats import type as type-only
3 pass, 0 fail
```

New unit test uses a temp dir with `mod/index.ts` and asserts `resolveImport(..., "./mod", ...)` → that `index.ts` path.
