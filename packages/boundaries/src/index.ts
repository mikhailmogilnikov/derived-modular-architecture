export {
  isBarrelIndexFilename,
  isInsideModule,
  isPublicImportTarget,
  layerOfPath,
  moduleRefOfPath,
} from "./classify-path.js";
export {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  LAYER_RANK,
  MODULE_LAYERS,
} from "./constants.js";
export { isUnderDir, relativeSegments } from "./path-utils.js";
export type {
  Layer,
  ModuleLayer,
  PathContext,
  PathModuleRef,
} from "./types.js";
