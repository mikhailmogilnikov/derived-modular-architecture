import { describe, expect, test } from "bun:test";
import { catalogStore } from "./catalog.store";

describe("catalogStore", () => {
  test("exposes seeded products with ids and prices", () => {
    expect(catalogStore.products).toHaveLength(3);
    expect(catalogStore.products[0]).toMatchObject({
      id: "p-1",
      priceCents: 2900,
    });
  });
});
