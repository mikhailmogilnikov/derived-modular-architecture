import { dirname, relative } from "node:path";
import { isBarrelIndexFilename } from "./classify-path.js";

const EXPORT_FROM_RE =
  /\bexport\s+(?:\*|\{[\s\S]*?\})\s+from\s+["']([^"']+)["']/g;
const EXTENSION_RE = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|mdx?)$/i;
const PATH_SEP_RE = /[/\\]/;
const TRAILING_INDEX_RE = /\/index$/;

const stripExtension = (filePath: string): string =>
  filePath.replace(EXTENSION_RE, "");

/** Collect unique `export … from` sources in a barrel file. */
export const collectExportFromSources = (sourceText: string): string[] => {
  const sources = new Set<string>();
  EXPORT_FROM_RE.lastIndex = 0;
  let match = EXPORT_FROM_RE.exec(sourceText);
  while (match !== null) {
    if (match[1]) {
      sources.add(match[1]);
    }
    match = EXPORT_FROM_RE.exec(sourceText);
  }
  return [...sources];
};

export const isBarrelReexportSource = (
  filePath: string,
  sourceText: string
): boolean => {
  const base = filePath.split(PATH_SEP_RE).pop() ?? "";
  if (!isBarrelIndexFilename(base)) {
    return false;
  }
  return collectExportFromSources(sourceText).length > 0;
};

/**
 * If the barrel text has exactly one re-export target, return that specifier.
 */
export const uniqueBarrelExportSpecifier = (
  sourceText: string
): string | null => {
  const sources = collectExportFromSources(sourceText);
  if (sources.length !== 1) {
    return null;
  }
  return sources[0] ?? null;
};

/** Rewrite an import specifier that resolved to a barrel toward a direct public file. */
export const rewriteBarrelSpecifier = (
  specifier: string,
  barrelFile: string,
  targetFile: string
): string | null => {
  const moduleRoot = dirname(barrelFile);
  const relToModule = relative(moduleRoot, stripExtension(targetFile))
    .split("\\")
    .join("/");
  if (relToModule.startsWith("..") || relToModule.length === 0) {
    return null;
  }

  if (specifier.startsWith("@/") || specifier.startsWith(".")) {
    const withoutIndex = specifier.replace(TRAILING_INDEX_RE, "");
    return `${withoutIndex}/${relToModule}`;
  }

  return null;
};
