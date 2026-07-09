import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { DmaEnvironmentError } from "./errors";
import { isSourceFileName } from "./source-files";
import type { Layer, ModuleRef } from "./types";

const LAYER_NAMES = [
  "app",
  "features",
  "services",
  "shared",
] as const satisfies readonly Layer[];
const MODULE_LAYERS = ["features", "services"] as const;
const SEGMENT_DIRS = new Set(["ui", "model", "api"]);

export interface DiscoveredProject {
  layers: Partial<Record<Layer, string>>;
  modules: ModuleRef[];
  projectRoot: string;
  sourceFiles: string[];
  srcRoot: string;
}

const moduleNameFromFile = (filename: string): string => {
  const extension = extname(filename);
  return basename(filename, extension);
};

const countSourceFiles = (dirPath: string): number => {
  let count = 0;
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules") {
      continue;
    }
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countSourceFiles(fullPath);
    } else if (isSourceFileName(entry.name)) {
      count += 1;
    }
  }
  return count;
};

const dirModuleStage = (modulePath: string): 1 | 2 => {
  const entries = readdirSync(modulePath, { withFileTypes: true });
  const hasPublic = entries.some(
    (entry) => entry.isDirectory() && entry.name === "public"
  );
  const hasSegment = entries.some(
    (entry) => entry.isDirectory() && SEGMENT_DIRS.has(entry.name)
  );
  if (hasPublic && hasSegment) {
    return 2;
  }
  if (hasPublic || countSourceFiles(modulePath) > 1) {
    return 1;
  }
  return 1;
};

const collectSourceFiles = (dirPath: string, out: string[]): void => {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules") {
      continue;
    }
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, out);
      continue;
    }
    if (isSourceFileName(entry.name)) {
      out.push(fullPath);
    }
  }
};

const discoverModules = (
  layer: "features" | "services",
  layerPath: string
): ModuleRef[] => {
  const modules: ModuleRef[] = [];
  const entries = readdirSync(layerPath, { withFileTypes: true });

  for (const entry of entries) {
    const { name } = entry;
    const fullPath = join(layerPath, name);
    if (entry.isDirectory()) {
      modules.push({
        id: `${layer}/${name}`,
        kind: "dir",
        layer,
        name,
        rootPath: fullPath,
        stage: dirModuleStage(fullPath),
      });
      continue;
    }
    if (!isSourceFileName(name)) {
      continue;
    }
    const moduleName = moduleNameFromFile(name);
    modules.push({
      id: `${layer}/${moduleName}`,
      kind: "file",
      layer,
      name: moduleName,
      rootPath: fullPath,
      stage: 0,
    });
  }

  return modules;
};

export const discover = (projectRoot: string): DiscoveredProject => {
  const absoluteRoot = resolve(projectRoot);
  const srcRoot = join(absoluteRoot, "src");

  if (!(existsSync(srcRoot) && statSync(srcRoot).isDirectory())) {
    throw new DmaEnvironmentError("src/ not found");
  }

  const layers: Partial<Record<Layer, string>> = {};
  for (const layer of LAYER_NAMES) {
    const layerPath = join(srcRoot, layer);
    if (existsSync(layerPath) && statSync(layerPath).isDirectory()) {
      layers[layer] = layerPath;
    }
  }

  const modules: ModuleRef[] = [];
  for (const layer of MODULE_LAYERS) {
    const layerPath = layers[layer];
    if (layerPath === undefined) {
      continue;
    }
    modules.push(...discoverModules(layer, layerPath));
  }

  const sourceFiles: string[] = [];
  collectSourceFiles(srcRoot, sourceFiles);

  return {
    layers,
    modules,
    projectRoot: absoluteRoot,
    sourceFiles,
    srcRoot,
  };
};
