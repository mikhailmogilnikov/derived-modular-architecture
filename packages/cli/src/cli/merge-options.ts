import { resolve } from "node:path";
import {
  DEFAULT_DMA_CONFIG,
  type DmaConfig,
  type ResolvedDmaOptions,
} from "../core/config-types";
import type { LoadedConfig } from "../core/load-config";
import type { CliArgs } from "./parse-args";

export const mergeOptions = (
  args: CliArgs,
  loaded?: LoadedConfig
): ResolvedDmaOptions => {
  const config: DmaConfig = loaded?.config ?? {};

  const srcRoot = config.srcRoot ?? DEFAULT_DMA_CONFIG.srcRoot;
  const compositionRoots =
    config.compositionRoots ?? DEFAULT_DMA_CONFIG.compositionRoots;

  const includePackages = args.includePackagesExplicit
    ? args.includePackages
    : (config.includePackages ?? DEFAULT_DMA_CONFIG.includePackages);

  let roots: string[] | undefined;
  if (args.roots !== undefined && args.roots.length > 0) {
    roots = args.roots.map((root) => resolve(root));
  } else if (config.roots !== undefined && config.roots.length > 0) {
    const base = loaded?.configDir ?? process.cwd();
    roots = config.roots.map((root) => resolve(base, root));
  }

  return {
    compositionRoots,
    configDir: loaded?.configDir,
    configPath: loaded?.configPath,
    includePackages,
    roots,
    srcRoot,
  };
};
