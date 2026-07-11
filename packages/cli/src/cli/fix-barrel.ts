import { existsSync, readFileSync } from "node:fs";
import {
  isBarrelReexportSource,
  uniqueBarrelExportSpecifier,
} from "@derived-modular/boundaries";
import { resolveImport } from "../core/resolve";
import type { PathAlias } from "../core/tsconfig-paths";

const EXTENSION_RE = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|mdx?)$/i;

export const stripSourceExtension = (filePath: string): string =>
  filePath.replace(EXTENSION_RE, "");

export const isBarrelReexportFile = (
  filePath: string,
  sourceText?: string
): boolean => {
  if (!existsSync(filePath)) {
    return false;
  }
  const text = sourceText ?? readFileSync(filePath, "utf8");
  return isBarrelReexportSource(filePath, text);
};

export const uniqueBarrelTarget = (
  barrelFile: string,
  aliases: PathAlias[],
  projectRoot: string,
  sourceText?: string
): string | null => {
  if (!existsSync(barrelFile)) {
    return null;
  }
  const text = sourceText ?? readFileSync(barrelFile, "utf8");
  const source = uniqueBarrelExportSpecifier(text);
  if (source === null) {
    return null;
  }
  return resolveImport(barrelFile, source, aliases, projectRoot);
};
