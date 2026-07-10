import { describe, expect, test } from "bun:test";
import type { Product } from "@/shared/domain/product";
import { addToCart, cartItemCount, cartTotal } from "./cart";

const sampleProduct: Product = {
  id: "test-1",
  name: "Test item",
  priceCents: 500,
};

describe("cart", () => {
  test("starts with at least the seed item", () => {
    expect(cartItemCount()).toBeGreaterThanOrEqual(1);
    expect(cartTotal()).toBeGreaterThanOrEqual(1200);
  });

  test("addToCart increases count and total", () => {
    const beforeCount = cartItemCount();
    const beforeTotal = cartTotal();

    addToCart(sampleProduct);

    expect(cartItemCount()).toBe(beforeCount + 1);
    expect(cartTotal()).toBe(beforeTotal + 500);
  });
});
