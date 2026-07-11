import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createJiti } from "jiti";

export const CONFIG_FILENAMES = [
  "dma.config.ts",
  "dma.config.mts",
  "dma.config.mjs",
  "dma.config.js",
  "dma.config.json",
] as const;

export interface DmaLayoutConfig {
  compositionRoots?: string[];
  srcRoot?: string;
}

const isFile = (path: string): boolean =>
  existsSync(path) && statSync(path).isFile();

const layoutCache = new Map<string, DmaLayoutConfig | null>();

export const findConfigPath = (startDir: string): string | undefined => {
  let current = resolve(startDir);
  for (;;) {
    for (const name of CONFIG_FILENAMES) {
      const candidate = join(current, name);
      if (isFile(candidate)) {
        return candidate;
      }
    }
    const parent = dirname(current);
    if (parent === current) {
      return;
    }
    current = parent;
  }
};

const unwrapExport = (mod: unknown): unknown => {
  if (typeof mod !== "object" || mod === null) {
    return mod;
  }
  const record = mod as { default?: unknown };
  if ("default" in record) {
    return record.default;
  }
  return mod;
};

const pickLayout = (value: unknown): DmaLayoutConfig | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const layout: DmaLayoutConfig = {};
  if (typeof record.srcRoot === "string" && record.srcRoot.length > 0) {
    layout.srcRoot = record.srcRoot;
  }
  if (
    Array.isArray(record.compositionRoots) &&
    record.compositionRoots.every((item) => typeof item === "string")
  ) {
    layout.compositionRoots = record.compositionRoots as string[];
  }
  return layout;
};

const loadConfigFile = (configPath: string): DmaLayoutConfig | null => {
  try {
    if (configPath.toLowerCase().endsWith(".json")) {
      return pickLayout(JSON.parse(readFileSync(configPath, "utf8")));
    }
    const jiti = createJiti(import.meta.url, { interopDefault: true });
    return pickLayout(unwrapExport(jiti(configPath)));
  } catch {
    return null;
  }
};

/** Soft-load layout fields from upward `dma.config.*` (invalid/missing → null). */
export const loadLayoutConfigNear = (
  startPath: string
): DmaLayoutConfig | null => {
  const absoluteStart = resolve(startPath);
  const startDir =
    existsSync(absoluteStart) && statSync(absoluteStart).isDirectory()
      ? absoluteStart
      : dirname(absoluteStart);
  const cached = layoutCache.get(startDir);
  if (cached !== undefined) {
    return cached;
  }
  const found = findConfigPath(startDir);
  if (found === undefined) {
    layoutCache.set(startDir, null);
    return null;
  }
  const layout = loadConfigFile(found);
  layoutCache.set(startDir, layout);
  return layout;
};

/** Test helper. */
export const clearLayoutConfigCache = (): void => {
  layoutCache.clear();
};
