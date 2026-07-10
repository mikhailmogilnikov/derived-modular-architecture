import { get } from "svelte/store";
import { afterEach, describe, expect, it } from "vitest";
import { catalogStore, setCatalogSearchQuery } from "./catalog.store";

afterEach(() => {
  setCatalogSearchQuery("");
});

describe("catalog store", () => {
  it("starts with an empty search query", () => {
    expect(get(catalogStore).searchQuery).toBe("");
  });

  it("updates the search query", () => {
    setCatalogSearchQuery("tea");

    expect(get(catalogStore).searchQuery).toBe("tea");
  });
});
