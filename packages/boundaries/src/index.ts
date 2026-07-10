export {
  isBarrelIndexFilename,
  isInsideModule,
  isPublicImportTarget,
  layerOfPath,
  moduleRefOfPath,
} from "./classify-path.ts";
export {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  LAYER_RANK,
  MODULE_LAYERS,
} from "./constants.ts";
export { isUnderDir, relativeSegments } from "./path-utils.ts";
export type {
  Layer,
  ModuleLayer,
  PathContext,
  PathModuleRef,
} from "./types.ts";
