import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { DmaEnvironmentError } from "./errors";

export interface PathAlias {
  baseDir: string;
  prefix: string;
}

interface TsconfigJson {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
  extends?: string;
}

const readJson = (filePath: string): unknown => {
  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (readError) {
    throw new DmaEnvironmentError(`Invalid tsconfig JSON: ${filePath}`, {
      cause: readError,
    });
  }
  const { config, error: parseError } = ts.parseConfigFileTextToJson(
    filePath,
    text
  );
  if (parseError) {
    throw new DmaEnvironmentError(`Invalid tsconfig JSON: ${filePath}`, {
      cause: parseError,
    });
  }
  return config;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseTsconfig = (filePath: string): TsconfigJson => {
  const raw = readJson(filePath);
  if (!isRecord(raw)) {
    throw new DmaEnvironmentError(`Invalid tsconfig JSON: ${filePath}`);
  }
  return raw as TsconfigJson;
};

const stripStar = (pattern: string): string =>
  pattern.endsWith("/*") ? pattern.slice(0, -2) : pattern;

const pathsFromConfig = (
  config: TsconfigJson,
  configDir: string
): PathAlias[] => {
  const paths = config.compilerOptions?.paths;
  if (!paths) {
    return [];
  }
  const aliases: PathAlias[] = [];
  for (const [pattern, targets] of Object.entries(paths)) {
    const [target] = targets;
    if (!target) {
      continue;
    }
    aliases.push({
      baseDir: resolve(configDir, stripStar(target)),
      prefix: stripStar(pattern),
    });
  }
  return aliases;
};

export const loadPathAliases = (projectRoot: string): PathAlias[] => {
  const tsconfigPath = join(projectRoot, "tsconfig.json");
  if (!existsSync(tsconfigPath)) {
    return [];
  }

  const config = parseTsconfig(tsconfigPath);
  let aliases = pathsFromConfig(config, projectRoot);

  if (aliases.length === 0 && config.extends) {
    const extendedPath = resolve(projectRoot, config.extends);
    if (existsSync(extendedPath)) {
      const extended = parseTsconfig(extendedPath);
      aliases = pathsFromConfig(extended, dirname(extendedPath));
    }
  }

  return aliases;
};
