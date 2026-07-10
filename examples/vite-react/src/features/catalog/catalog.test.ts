import { describe, expect, it } from "vitest";
import type { Product } from "@/shared/model/product";
import {
  getCatalogCategory,
  setCatalogCategory,
  setCatalogSearchQuery,
} from "./catalog.store";
import { CatalogPage } from "./public/catalog-page";

const sampleProducts: readonly Product[] = [
  { category: "books", id: "a", name: "A", price: 1 },
  { category: "merch", id: "b", name: "B", price: 2 },
];

describe("catalog module", () => {
  it("exports the public page component", () => {
    expect(typeof CatalogPage).toBe("function");
  });

  it("pairs demo data with store filters", () => {
    setCatalogCategory("books");
    setCatalogSearchQuery("");

    const books = sampleProducts.filter(
      (product) =>
        getCatalogCategory() === "all" ||
        product.category === getCatalogCategory()
    );

    expect(books.every((product) => product.category === "books")).toBe(true);
    expect(books.length).toBeGreaterThan(0);
  });
});
