import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addCartItem,
  cartItemCount,
  cartItems,
  cartTotal,
  clearCart,
} from "./cart";

beforeEach(() => {
  clearCart();
});

afterEach(() => {
  clearCart();
});

describe("cart service", () => {
  it("adds a new item", () => {
    addCartItem({ id: "tea", name: "Green tea", price: 4.5 });

    expect(get(cartItems)).toEqual([
      { id: "tea", name: "Green tea", price: 4.5, qty: 1 },
    ]);
  });

  it("increments quantity for existing items", () => {
    addCartItem({ id: "tea", name: "Green tea", price: 4.5 });
    addCartItem({ id: "tea", name: "Green tea", price: 4.5, qty: 2 });

    expect(get(cartItems)).toEqual([
      { id: "tea", name: "Green tea", price: 4.5, qty: 3 },
    ]);
  });

  it("derives total and item count", () => {
    addCartItem({ id: "mug", name: "Ceramic mug", price: 12, qty: 2 });

    expect(get(cartTotal)).toBe(24);
    expect(get(cartItemCount)).toBe(2);
  });

  it("clears all items", () => {
    addCartItem({ id: "tea", name: "Green tea", price: 4.5 });
    clearCart();

    expect(get(cartItems)).toEqual([]);
    expect(get(cartTotal)).toBe(0);
  });
});
