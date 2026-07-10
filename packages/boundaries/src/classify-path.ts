import { join } from "node:path";
import {
  hasSourceExtension,
  isUnderDir,
  relativeSegments,
  stripSourceExtension,
} from "./path-utils.ts";
import type { Layer, PathContext, PathModuleRef } from "./types.ts";

export const isBarrelIndexFilename = (filename: string): boolean =>
  filename === "index.ts" || filename === "index.tsx";

export const layerOfPath = (
  filePath: string,
  ctx: PathContext
): Layer | null => {
  const segments = relativeSegments(filePath, ctx.srcRoot);
  if (segments === null || segments.length === 0) {
    return null;
  }
  const [top] = segments;
  if (top === undefined) {
    return null;
  }
  if (ctx.compositionRootDirnames.includes(top)) {
    return "app";
  }
  if (top === "features" || top === "services" || top === "shared") {
    return top;
  }
  return null;
};

export const moduleRefOfPath = (
  filePath: string,
  ctx: PathContext
): PathModuleRef | null => {
  const segments = relativeSegments(filePath, ctx.srcRoot);
  if (segments === null || segments.length < 2) {
    return null;
  }
  const [layerName, moduleEntry, ...rest] = segments;
  if (layerName !== "features" && layerName !== "services") {
    return null;
  }
  if (moduleEntry === undefined) {
    return null;
  }
  const layer = layerName;

  if (hasSourceExtension(moduleEntry) && rest.length === 0) {
    const name = stripSourceExtension(moduleEntry);
    return {
      id: `${layer}/${name}`,
      kind: "file",
      layer,
      name,
    };
  }

  if (hasSourceExtension(moduleEntry)) {
    return null;
  }

  return {
    id: `${layer}/${moduleEntry}`,
    kind: "dir",
    layer,
    name: moduleEntry,
  };
};

export const isPublicImportTarget = (
  filePath: string,
  ctx: PathContext
): boolean => {
  const mod = moduleRefOfPath(filePath, ctx);
  if (mod === null) {
    return false;
  }
  if (mod.kind === "file") {
    return true;
  }
  const publicDir = join(ctx.srcRoot, mod.layer, mod.name, "public");
  return filePath === publicDir || isUnderDir(filePath, publicDir);
};

export const isInsideModule = (
  filePath: string,
  mod: PathModuleRef,
  ctx: PathContext
): boolean => {
  if (mod.kind === "file") {
    const self = moduleRefOfPath(filePath, ctx);
    return self?.id === mod.id && self.kind === "file";
  }
  const moduleRoot = join(ctx.srcRoot, mod.layer, mod.name);
  return filePath === moduleRoot || isUnderDir(filePath, moduleRoot);
};
