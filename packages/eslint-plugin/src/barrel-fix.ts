import { existsSync, readFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { isBarrelIndexFilename } from "@derived-modular/boundaries";
import { resolveImportTarget } from "./resolve-import.js";

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

export const isBarrelReexportFile = (
  filePath: string,
  sourceText?: string
): boolean => {
  const base = filePath.split(PATH_SEP_RE).pop() ?? "";
  if (!isBarrelIndexFilename(base)) {
    return false;
  }
  const text = sourceText ?? readFileSync(filePath, "utf8");
  return collectExportFromSources(text).length > 0;
};

/**
 * If the barrel has exactly one re-export target, return its absolute file path.
 */
export const uniqueBarrelTarget = (
  barrelFile: string,
  srcRoot: string,
  sourceText?: string
): string | null => {
  if (!existsSync(barrelFile)) {
    return null;
  }
  const text = sourceText ?? readFileSync(barrelFile, "utf8");
  const sources = collectExportFromSources(text);
  if (sources.length !== 1) {
    return null;
  }
  const [source] = sources;
  if (source === undefined) {
    return null;
  }
  return resolveImportTarget(barrelFile, source, srcRoot);
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

  if (specifier.startsWith("@/")) {
    const withoutIndex = specifier.replace(TRAILING_INDEX_RE, "");
    return `${withoutIndex}/${relToModule}`;
  }

  if (specifier.startsWith(".")) {
    const withoutIndex = specifier.replace(TRAILING_INDEX_RE, "");
    return `${withoutIndex}/${relToModule}`;
  }

  return null;
};
