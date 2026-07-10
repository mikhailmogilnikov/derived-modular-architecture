import { describe, expect, test } from "bun:test";
import { searchStore } from "./search.store";

describe("searchStore", () => {
  test("tracks recent queries", () => {
    expect(searchStore.recentQueries.length).toBeGreaterThan(0);
    expect(searchStore.recentQueries).toContain("cart promotion");
  });
});
