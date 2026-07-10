export type Layer = "app" | "features" | "services" | "shared";

export type ModuleLayer = "features" | "services";

export interface PathContext {
  compositionRootDirnames: readonly string[];
  srcRoot: string;
}

export interface PathModuleRef {
  id: string;
  kind: "file" | "dir";
  layer: ModuleLayer;
  name: string;
}
