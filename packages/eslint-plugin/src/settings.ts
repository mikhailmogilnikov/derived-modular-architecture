import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  type PathContext,
} from "@derived-modular/boundaries";
import type { Rule } from "eslint";

export interface DmaSettings {
  compositionRoots?: string[];
  srcRoot?: string;
}

export type DmaPathContext = PathContext & { projectRoot: string };

export const readDmaSettings = (context: Rule.RuleContext): DmaSettings =>
  (context.settings?.dma ?? {}) as DmaSettings;

/** Resolve project root + absolute srcRoot from the linted filename. */
export const getPathContext = (
  context: Rule.RuleContext,
  filename: string
): DmaPathContext => {
  const settings = readDmaSettings(context);
  const srcRootName = settings.srcRoot ?? "src";
  const compositionRootDirnames = settings.compositionRoots ?? [
    ...DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  ];

  const normalized = filename.replaceAll("\\", "/");
  const srcToken = `/${srcRootName}/`;
  const idx = normalized.lastIndexOf(srcToken);
  if (idx !== -1) {
    const projectRoot = resolve(normalized.slice(0, idx));
    return {
      compositionRootDirnames,
      projectRoot,
      srcRoot: join(projectRoot, srcRootName),
    };
  }

  let dir = dirname(filename);
  let projectRoot = context.cwd ?? process.cwd();
  for (let i = 0; i < 24; i += 1) {
    const marker = join(dir, srcRootName);
    if (existsSync(marker) && statSync(marker).isDirectory()) {
      projectRoot = dir;
      break;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return {
    compositionRootDirnames,
    projectRoot,
    srcRoot: join(projectRoot, srcRootName),
  };
};
