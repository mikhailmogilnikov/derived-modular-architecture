import { describe, expect, test } from "bun:test";
import {
  collectExportFromSources,
  isBarrelReexportSource,
  rewriteBarrelSpecifier,
  uniqueBarrelExportSpecifier,
} from "../src/index";

describe("barrel-fix", () => {
  test("collectExportFromSources and unique specifier", () => {
    const text = 'export { Widget } from "./public/widget";\n';
    expect(collectExportFromSources(text)).toEqual(["./public/widget"]);
    expect(uniqueBarrelExportSpecifier(text)).toBe("./public/widget");
    expect(uniqueBarrelExportSpecifier("export const x = 1;\n")).toBeNull();
  });

  test("isBarrelReexportSource", () => {
    expect(
      isBarrelReexportSource(
        "/x/index.ts",
        'export { Widget } from "./public/widget";\n'
      )
    ).toBe(true);
    expect(
      isBarrelReexportSource("/x/widget.ts", "export const x = 1;\n")
    ).toBe(false);
  });

  test("rewriteBarrelSpecifier", () => {
    expect(
      rewriteBarrelSpecifier(
        "@/features/widget",
        "/proj/src/features/widget/index.ts",
        "/proj/src/features/widget/public/widget.ts"
      )
    ).toBe("@/features/widget/public/widget");
  });
});
