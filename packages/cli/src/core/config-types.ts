import { DEFAULT_COMPOSITION_ROOT_DIRNAMES } from "@derived-modular/boundaries";

export interface DmaConfig {
  /** Composition-root folder names under srcRoot. Default: `["app","pages","routes"]`. */
  compositionRoots?: string[];
  /** Widen monorepo discover to library packages. Default: `false`. */
  includePackages?: boolean;
  /** Explicit DMA roots (same as `--roots`). Paths relative to the config file directory. */
  roots?: string[];
  /** Source directory name/path relative to package root. Default: `"src"`. */
  srcRoot?: string;
}

export interface ResolvedDmaOptions {
  compositionRoots: readonly string[];
  configDir?: string;
  configPath?: string;
  includePackages: boolean;
  roots?: string[];
  srcRoot: string;
}

export const DEFAULT_DMA_CONFIG = {
  compositionRoots: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
  includePackages: false,
  srcRoot: "src",
} as const satisfies Omit<
  ResolvedDmaOptions,
  "configDir" | "configPath" | "roots"
>;

export const defineConfig = (config: DmaConfig): DmaConfig => config;
