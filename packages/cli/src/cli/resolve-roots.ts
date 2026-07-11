import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { discoverRoots } from "../core/discover-roots";
import { DmaEnvironmentError } from "../core/errors";
import type { CliArgs } from "./parse-args";

const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

const hasSrc = (dir: string): boolean => isDirectory(join(dir, "src"));

export const resolveRoots = (args: CliArgs): string[] => {
  if (args.roots !== undefined && args.roots.length > 0) {
    const resolved = args.roots.map((root) => resolve(root));
    for (const root of resolved) {
      if (!hasSrc(root)) {
        throw new DmaEnvironmentError(`src/ not found in ${root}`);
      }
    }
    return [...new Set(resolved)].sort((a, b) => a.localeCompare(b));
  }

  const absolutePath = resolve(args.path);
  if (hasSrc(absolutePath)) {
    return [absolutePath];
  }

  const found = discoverRoots({
    includePackages: args.includePackages,
    searchRoot: absolutePath,
  });
  if (found.length === 0) {
    throw new DmaEnvironmentError(
      "No DMA roots found. Pass an app path, --roots, or --include-packages."
    );
  }
  return found;
};
