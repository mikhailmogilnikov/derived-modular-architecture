# Final Fix Report: DMA CLI v1 Important findings

**Status:** DONE  
**Branch:** `feat/dma-cli-v1`

## Fixes

### 1. SARIF artifact URIs
- `formatSarif` now emits paths relative to `cwd` (`options.cwd ?? process.cwd()`).
- Files outside cwd fall back to absolute `file://` URIs via `pathToFileURL`.
- Minimal `driver.rules` populated from unique `ruleId`s.
- Unit test: `tests/unit/format-sarif.test.ts`.

### 2. tsconfig with comments
- `tsconfig-paths.ts` uses `ts.parseConfigFileTextToJson` instead of raw `JSON.parse`.
- Still throws `DmaEnvironmentError` on read/parse failures.
- One-level `extends` behavior unchanged.
- Unit test: `loadPathAliases accepts tsconfig with comments` in `resolve.test.ts`.

## Verification

- `cd packages/dma && bun test` → **24 pass, 0 fail**
- `bun x ultracite check` on touched files → clean

## Commits

- (see git log after commit)
