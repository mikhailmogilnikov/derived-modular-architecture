import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import {
  DEFAULT_COMPOSITION_ROOT_DIRNAMES,
  isBarrelIndexFilename,
  isPublicImportTarget,
  LAYER_RANK,
  layerOfPath,
  moduleRefOfPath,
} from "../src/index";

const srcRoot = "/proj/src";
const ctx = {
  compositionRootDirnames: [...DEFAULT_COMPOSITION_ROOT_DIRNAMES],
  srcRoot,
};

describe("classify-path", () => {
  test("pages and routes map to app layer", () => {
    expect(layerOfPath(join(srcRoot, "pages/index.tsx"), ctx)).toBe("app");
    expect(layerOfPath(join(srcRoot, "routes/home.tsx"), ctx)).toBe("app");
    expect(layerOfPath(join(srcRoot, "app/shell.tsx"), ctx)).toBe("app");
  });

  test("structural layers", () => {
    expect(layerOfPath(join(srcRoot, "features/a.tsx"), ctx)).toBe("features");
    expect(layerOfPath(join(srcRoot, "services/cart/public/x.ts"), ctx)).toBe(
      "services"
    );
    expect(layerOfPath(join(srcRoot, "shared/ui/button.tsx"), ctx)).toBe(
      "shared"
    );
  });

  test("feature dir module public vs deep", () => {
    const pub = join(srcRoot, "features/checkout/public/page.tsx");
    const deep = join(srcRoot, "features/checkout/ui/row.tsx");
    expect(moduleRefOfPath(pub, ctx)?.id).toBe("features/checkout");
    expect(isPublicImportTarget(pub, ctx)).toBe(true);
    expect(isPublicImportTarget(deep, ctx)).toBe(false);
  });

  test("stage-0 file module is fully public", () => {
    const file = join(srcRoot, "features/profile.tsx");
    expect(moduleRefOfPath(file, ctx)?.kind).toBe("file");
    expect(isPublicImportTarget(file, ctx)).toBe(true);
  });

  test("layer ranks are downward", () => {
    expect(LAYER_RANK.app).toBeGreaterThan(LAYER_RANK.features);
    expect(LAYER_RANK.features).toBeGreaterThan(LAYER_RANK.services);
    expect(LAYER_RANK.services).toBeGreaterThan(LAYER_RANK.shared);
  });

  test("barrel index filenames", () => {
    expect(isBarrelIndexFilename("index.ts")).toBe(true);
    expect(isBarrelIndexFilename("index.tsx")).toBe(true);
    expect(isBarrelIndexFilename("index.js")).toBe(false);
  });
});
