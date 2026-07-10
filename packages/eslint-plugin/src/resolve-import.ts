import { existsSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

const tryFile = (candidate: string): string | null => {
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }
  return null;
};

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".vue",
  ".svelte",
  ".astro",
  ".md",
  ".mdx",
] as const;

/** Resolve a relative or `@/`-aliased specifier to an absolute file path. */
export const resolveImportTarget = (
  fromFile: string,
  specifier: string,
  srcRoot: string
): string | null => {
  if (
    specifier.startsWith("node:") ||
    !(
      specifier.startsWith(".") ||
      specifier.startsWith("/") ||
      specifier.startsWith("@/")
    )
  ) {
    return null;
  }

  let base: string;
  if (specifier.startsWith("@/")) {
    base = join(srcRoot, specifier.slice(2));
  } else if (isAbsolute(specifier)) {
    base = specifier;
  } else {
    base = resolve(fromFile, "..", specifier);
  }

  const direct = tryFile(base);
  if (direct) {
    return direct;
  }

  for (const ext of EXTENSIONS) {
    const withExt = tryFile(`${base}${ext}`);
    if (withExt) {
      return withExt;
    }
  }

  for (const ext of EXTENSIONS) {
    const indexFile = tryFile(join(base, `index${ext}`));
    if (indexFile) {
      return indexFile;
    }
  }

  return null;
};
