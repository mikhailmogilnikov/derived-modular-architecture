import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import type { DmaConfig } from "./config-types";
import { DmaEnvironmentError } from "./errors";

export const CONFIG_FILENAMES = [
  "dma.config.ts",
  "dma.config.mts",
  "dma.config.mjs",
  "dma.config.js",
  "dma.config.json",
] as const;

const ALLOWED_KEYS = new Set([
  "compositionRoots",
  "includePackages",
  "roots",
  "srcRoot",
]);

export interface LoadedConfig {
  config: DmaConfig;
  configDir: string;
  configPath: string;
}

const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

const isFile = (path: string): boolean =>
  existsSync(path) && statSync(path).isFile();

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

const assertStringArray = (value: unknown, key: string): string[] => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new DmaEnvironmentError(
      `Invalid dma.config: "${key}" must be an array of strings`
    );
  }
  return value;
};

export const validateDmaConfig = (value: unknown): DmaConfig => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new DmaEnvironmentError(
      "Invalid dma.config: expected an object export"
    );
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new DmaEnvironmentError(`Invalid dma.config: unknown key "${key}"`);
    }
  }

  const config: DmaConfig = {};

  if (record.srcRoot !== undefined) {
    if (typeof record.srcRoot !== "string" || record.srcRoot.length === 0) {
      throw new DmaEnvironmentError(
        'Invalid dma.config: "srcRoot" must be a non-empty string'
      );
    }
    config.srcRoot = record.srcRoot;
  }

  if (record.compositionRoots !== undefined) {
    config.compositionRoots = assertStringArray(
      record.compositionRoots,
      "compositionRoots"
    );
  }

  if (record.roots !== undefined) {
    config.roots = assertStringArray(record.roots, "roots");
  }

  if (record.includePackages !== undefined) {
    if (typeof record.includePackages !== "boolean") {
      throw new DmaEnvironmentError(
        'Invalid dma.config: "includePackages" must be a boolean'
      );
    }
    config.includePackages = record.includePackages;
  }

  return config;
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

const loadJsonConfig = (configPath: string): DmaConfig => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new DmaEnvironmentError(`Failed to parse ${configPath}: ${message}`, {
      cause: error,
    });
  }
  return validateDmaConfig(parsed);
};

const loadJsConfig = async (configPath: string): Promise<DmaConfig> => {
  const { href } = pathToFileURL(configPath);
  try {
    const mod: unknown = await import(href);
    return validateDmaConfig(unwrapExport(mod));
  } catch (error) {
    if (error instanceof DmaEnvironmentError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new DmaEnvironmentError(`Failed to load ${configPath}: ${message}`, {
      cause: error,
    });
  }
};

const loadTsConfig = (configPath: string): DmaConfig => {
  try {
    const jiti = createJiti(import.meta.url, { interopDefault: true });
    const mod: unknown = jiti(configPath);
    return validateDmaConfig(unwrapExport(mod));
  } catch (error) {
    if (error instanceof DmaEnvironmentError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new DmaEnvironmentError(`Failed to load ${configPath}: ${message}`, {
      cause: error,
    });
  }
};

export const loadConfigFile = async (
  configPath: string
): Promise<LoadedConfig> => {
  const absolute = resolve(configPath);
  if (!isFile(absolute)) {
    throw new DmaEnvironmentError(`Config file not found: ${absolute}`);
  }

  const lower = absolute.toLowerCase();
  let config: DmaConfig;
  if (lower.endsWith(".json")) {
    config = loadJsonConfig(absolute);
  } else if (lower.endsWith(".ts") || lower.endsWith(".mts")) {
    config = loadTsConfig(absolute);
  } else {
    config = await loadJsConfig(absolute);
  }

  return {
    config,
    configDir: dirname(absolute),
    configPath: absolute,
  };
};

export const loadConfig = async (
  startPath: string,
  explicitConfig?: string
): Promise<LoadedConfig | undefined> => {
  if (explicitConfig !== undefined) {
    const absolute = isAbsolute(explicitConfig)
      ? explicitConfig
      : resolve(explicitConfig);
    return await loadConfigFile(absolute);
  }

  const absoluteStart = resolve(startPath);
  const startDir = isDirectory(absoluteStart)
    ? absoluteStart
    : dirname(absoluteStart);
  const found = findConfigPath(startDir);
  if (found === undefined) {
    return;
  }
  return await loadConfigFile(found);
};
