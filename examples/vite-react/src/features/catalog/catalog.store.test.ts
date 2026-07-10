import { afterEach, describe, expect, it } from "vitest";
import {
  getCatalogCategory,
  getCatalogSearchQuery,
  setCatalogCategory,
  setCatalogSearchQuery,
} from "./catalog.store";

afterEach(() => {
  setCatalogCategory("all");
  setCatalogSearchQuery("");
});

describe("catalog store", () => {
  it("starts with default filters", () => {
    expect(getCatalogCategory()).toBe("all");
    expect(getCatalogSearchQuery()).toBe("");
  });

  it("updates category and search query", () => {
    setCatalogCategory("books");
    setCatalogSearchQuery("dma");

    expect(getCatalogCategory()).toBe("books");
    expect(getCatalogSearchQuery()).toBe("dma");
  });
});
