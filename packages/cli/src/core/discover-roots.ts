import type { Dirent } from "node:fs";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEFAULT_COMPOSITION_ROOT_DIRNAMES } from "@derived-modular/boundaries";

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  ".git",
  "coverage",
  "build",
  ".turbo",
  ".next",
  "out",
]);

const LAYER_DIR_NAMES = ["features", "services", "shared"] as const;

export interface DiscoverRootsOptions {
  compositionRoots?: readonly string[];
  includePackages: boolean;
  /** Max depth for walk fallback (default 4). */
  maxDepth?: number;
  /** Absolute monorepo / search root */
  searchRoot: string;
  srcRoot?: string;
}

const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

const hasSrcRoot = (dir: string, srcRootName: string): boolean =>
  isDirectory(join(dir, srcRootName));

export const isDmaRoot = (
  dir: string,
  includePackages: boolean,
  layout?: {
    compositionRoots?: readonly string[];
    srcRoot?: string;
  }
): boolean => {
  const srcRootName = layout?.srcRoot ?? "src";
  const compositionDirnames =
    layout?.compositionRoots ?? DEFAULT_COMPOSITION_ROOT_DIRNAMES;
  if (!hasSrcRoot(dir, srcRootName)) {
    return false;
  }
  const srcRoot = join(dir, srcRootName);
  for (const name of compositionDirnames) {
    if (isDirectory(join(srcRoot, name))) {
      return true;
    }
  }
  if (!includePackages) {
    return false;
  }
  for (const name of LAYER_DIR_NAMES) {
    if (isDirectory(join(srcRoot, name))) {
      return true;
    }
  }
  return false;
};

const expandWorkspacePattern = (root: string, pattern: string): string[] => {
  const trimmed = pattern.trim();
  if (trimmed.length === 0) {
    return [];
  }

  if (!trimmed.includes("*")) {
    const full = resolve(root, trimmed);
    return isDirectory(full) ? [full] : [];
  }

  // Support a single trailing `/*` segment only (e.g. apps/*, packages/*).
  if (!trimmed.endsWith("/*") || trimmed.indexOf("*") !== trimmed.length - 1) {
    return [];
  }

  const parentRel = trimmed.slice(0, -2);
  const parent = resolve(root, parentRel);
  if (!isDirectory(parent)) {
    return [];
  }

  const results: string[] = [];
  for (const entry of readdirSync(parent, { withFileTypes: true })) {
    if (!(entry.isDirectory() && !SKIP_DIR_NAMES.has(entry.name))) {
      continue;
    }
    if (entry.name.startsWith(".")) {
      continue;
    }
    results.push(join(parent, entry.name));
  }
  return results;
};

const LINE_SPLIT_RE = /\r?\n/;
const PNPM_PACKAGES_HEADER_RE = /^packages:\s*$/;
const NON_WHITESPACE_START_RE = /^\S/;
const PNPM_PACKAGE_ITEM_RE = /^\s*-\s*['"]?([^'"#\s]+)['"]?\s*$/;

const readNpmWorkspaces = (root: string): string[] | null => {
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }
  const { workspaces } = parsed as { workspaces?: unknown };
  if (Array.isArray(workspaces)) {
    return workspaces.filter(
      (item): item is string => typeof item === "string"
    );
  }
  if (
    typeof workspaces === "object" &&
    workspaces !== null &&
    Array.isArray((workspaces as { packages?: unknown }).packages)
  ) {
    return (workspaces as { packages: unknown[] }).packages.filter(
      (item): item is string => typeof item === "string"
    );
  }
  return null;
};

const parsePnpmWorkspacePackages = (content: string): string[] => {
  const packages: string[] = [];
  let inPackages = false;
  for (const line of content.split(LINE_SPLIT_RE)) {
    if (PNPM_PACKAGES_HEADER_RE.test(line)) {
      inPackages = true;
      continue;
    }
    if (!inPackages) {
      continue;
    }
    if (NON_WHITESPACE_START_RE.test(line)) {
      break;
    }
    const match = line.match(PNPM_PACKAGE_ITEM_RE);
    if (match?.[1]) {
      packages.push(match[1]);
    }
  }
  return packages;
};

const readPnpmWorkspaces = (root: string): string[] | null => {
  const yamlPath = join(root, "pnpm-workspace.yaml");
  if (!existsSync(yamlPath)) {
    return null;
  }
  const packages = parsePnpmWorkspacePackages(readFileSync(yamlPath, "utf8"));
  return packages.length > 0 ? packages : null;
};

const collectWorkspaceCandidates = (root: string): string[] | null => {
  const patterns = readNpmWorkspaces(root) ?? readPnpmWorkspaces(root);
  if (patterns === null) {
    return null;
  }
  const candidates: string[] = [];
  for (const pattern of patterns) {
    candidates.push(...expandWorkspacePattern(root, pattern));
  }
  return candidates;
};

const walkSrcCandidates = (
  dir: string,
  depth: number,
  maxDepth: number,
  srcRootName: string,
  out: string[]
): void => {
  if (depth > maxDepth) {
    return;
  }
  if (hasSrcRoot(dir, srcRootName)) {
    out.push(dir);
  }
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (SKIP_DIR_NAMES.has(entry.name) || entry.name.startsWith(".")) {
      continue;
    }
    walkSrcCandidates(
      join(dir, entry.name),
      depth + 1,
      maxDepth,
      srcRootName,
      out
    );
  }
};

const uniqueSorted = (paths: string[]): string[] =>
  [...new Set(paths.map((path) => resolve(path)))].sort((a, b) =>
    a.localeCompare(b)
  );

export const discoverRoots = (options: DiscoverRootsOptions): string[] => {
  const searchRoot = resolve(options.searchRoot);
  const maxDepth = options.maxDepth ?? 4;
  const srcRootName = options.srcRoot ?? "src";
  const layout = {
    compositionRoots: options.compositionRoots,
    srcRoot: srcRootName,
  };
  const workspaceCandidates = collectWorkspaceCandidates(searchRoot);
  const candidates =
    workspaceCandidates ??
    (() => {
      const walked: string[] = [];
      walkSrcCandidates(searchRoot, 0, maxDepth, srcRootName, walked);
      return walked;
    })();

  const roots = candidates.filter((candidate) =>
    isDmaRoot(candidate, options.includePackages, layout)
  );
  return uniqueSorted(roots);
};
