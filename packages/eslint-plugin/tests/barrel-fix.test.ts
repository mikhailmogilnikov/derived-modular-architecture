import { describe, expect, test } from "bun:test";
import {
  collectExportFromSources,
  rewriteBarrelSpecifier,
} from "@derived-modular/boundaries";

describe("barrel-fix (boundaries)", () => {
  test("collectExportFromSources finds unique source", () => {
    expect(
      collectExportFromSources('export { Widget } from "./public/widget";\n')
    ).toEqual(["./public/widget"]);
  });

  test("rewriteBarrelSpecifier keeps @/ prefix", () => {
    expect(
      rewriteBarrelSpecifier(
        "@/features/widget",
        "/proj/src/features/widget/index.ts",
        "/proj/src/features/widget/public/widget.ts"
      )
    ).toBe("@/features/widget/public/widget");
  });

  test("rewriteBarrelSpecifier strips /index", () => {
    expect(
      rewriteBarrelSpecifier(
        "../widget/index",
        "/proj/src/features/widget/index.ts",
        "/proj/src/features/widget/public/widget.ts"
      )
    ).toBe("../widget/public/widget");
  });
});
