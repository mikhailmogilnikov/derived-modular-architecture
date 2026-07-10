import type { Layer } from "./types.ts";

/** Framework / DMA dirs treated as composition root (same rules as DMA `app/`). */
export const DEFAULT_COMPOSITION_ROOT_DIRNAMES = [
  "app",
  "pages",
  "routes",
] as const;

export const LAYER_RANK: Record<Layer, number> = {
  app: 3,
  features: 2,
  services: 1,
  shared: 0,
};

export const MODULE_LAYERS = ["features", "services"] as const;
