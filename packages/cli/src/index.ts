/** Public package entry — intentional re-export surface for @derived-modular/cli. */

export { DEFAULT_COMPOSITION_ROOT_DIRNAMES } from "@derived-modular/boundaries";
export { analyze } from "./core/analyze";
export type { DmaConfig, ResolvedDmaOptions } from "./core/config-types";
export { defineConfig } from "./core/config-types";
export { DmaEnvironmentError } from "./core/errors";
export { DEFAULT_THRESHOLDS } from "./core/thresholds";
export type {
  AnalyzeMode,
  AnalyzeResult,
  Diagnostic,
  Severity,
} from "./core/types";
