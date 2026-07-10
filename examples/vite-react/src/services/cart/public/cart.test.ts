import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addCartItem,
  cartTotal,
  clearCart,
  getCartItemCount,
  getCartItems,
  subscribeCart,
} from "./cart";

afterEach(() => {
  clearCart();
});

describe("cart service", () => {
  it("starts empty", () => {
    expect(getCartItemCount()).toBe(0);
    expect(getCartItems()).toEqual([]);
  });

  it("adds items and computes total", () => {
    addCartItem({
      category: "books",
      id: "dma-handbook",
      name: "DMA Handbook",
      price: 29,
    });
    addCartItem({
      category: "merch",
      id: "lint-stickers",
      name: "Lint Stickers (×3)",
      price: 12,
    });

    expect(getCartItemCount()).toBe(2);
    expect(cartTotal()).toBe(41);
  });

  it("notifies subscribers on change", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCart(listener);

    addCartItem({
      category: "books",
      id: "modular-patterns",
      name: "Modular Patterns",
      price: 34,
    });

    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("clears all items", () => {
    addCartItem({
      category: "books",
      id: "dma-handbook",
      name: "DMA Handbook",
      price: 29,
    });

    clearCart();

    expect(getCartItems()).toEqual([]);
    expect(cartTotal()).toBe(0);
  });
});
