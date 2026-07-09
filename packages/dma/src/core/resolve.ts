import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { PathAlias } from "./tsconfig-paths";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;
const INDEX_FILES = ["index.ts", "index.tsx", "index.js", "index.jsx"] as const;

const isExistingFile = (path: string): boolean => {
  try {
    return existsSync(path) && statSync(path).isFile();
  } catch {
    return false;
  }
};

const tryResolvePath = (absoluteBase: string): string | null => {
  for (const ext of EXTENSIONS) {
    const withExt = `${absoluteBase}${ext}`;
    if (isExistingFile(withExt)) {
      return withExt;
    }
  }
  if (isExistingFile(absoluteBase)) {
    return absoluteBase;
  }
  for (const indexFile of INDEX_FILES) {
    const indexPath = join(absoluteBase, indexFile);
    if (isExistingFile(indexPath)) {
      return indexPath;
    }
  }
  return null;
};

const isRelative = (specifier: string): boolean =>
  specifier.startsWith("./") || specifier.startsWith("../");

const findLongestAlias = (
  specifier: string,
  aliases: PathAlias[]
): PathAlias | null => {
  let best: PathAlias | null = null;
  for (const alias of aliases) {
    if (
      (specifier === alias.prefix ||
        specifier.startsWith(`${alias.prefix}/`)) &&
      (!best || alias.prefix.length > best.prefix.length)
    ) {
      best = alias;
    }
  }
  return best;
};

export const resolveImport = (
  fromFile: string,
  specifier: string,
  aliases: PathAlias[],
  _projectRoot: string
): string | null => {
  if (isRelative(specifier)) {
    return tryResolvePath(resolve(dirname(fromFile), specifier));
  }

  const alias = findLongestAlias(specifier, aliases);
  if (alias) {
    const rest =
      specifier === alias.prefix
        ? ""
        : specifier.slice(alias.prefix.length + 1);
    const candidate = rest ? join(alias.baseDir, rest) : alias.baseDir;
    return tryResolvePath(candidate);
  }

  // Bare package import or unresolved — skip edge
  return null;
};
