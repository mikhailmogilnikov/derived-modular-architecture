import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ResolvedDmaOptions } from "../core/config-types";
import { discoverRoots } from "../core/discover-roots";
import { DmaEnvironmentError } from "../core/errors";
import type { CliArgs } from "./parse-args";

const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

const hasSrcRoot = (dir: string, srcRootName: string): boolean =>
  isDirectory(join(dir, srcRootName));

export const resolveRoots = (
  args: CliArgs,
  options: ResolvedDmaOptions
): string[] => {
  const srcRootName = options.srcRoot;

  if (options.roots !== undefined && options.roots.length > 0) {
    const resolved = options.roots.map((root) => resolve(root));
    for (const root of resolved) {
      if (!hasSrcRoot(root, srcRootName)) {
        throw new DmaEnvironmentError(`${srcRootName}/ not found in ${root}`);
      }
    }
    return [...new Set(resolved)].sort((a, b) => a.localeCompare(b));
  }

  const absolutePath = resolve(args.path);
  if (hasSrcRoot(absolutePath, srcRootName)) {
    return [absolutePath];
  }

  const found = discoverRoots({
    compositionRoots: options.compositionRoots,
    includePackages: options.includePackages,
    searchRoot: absolutePath,
    srcRoot: srcRootName,
  });
  if (found.length === 0) {
    throw new DmaEnvironmentError(
      "No DMA roots found. Pass an app path, --roots, --include-packages, or dma.config roots."
    );
  }
  return found;
};
