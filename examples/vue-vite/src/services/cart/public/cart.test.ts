import { beforeEach, describe, expect, it, vi } from "vitest";

describe("cart", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("starts empty", async () => {
		const { getCartItemCount, getCartItems } = await import("./cart");
		expect(getCartItemCount()).toBe(0);
		expect(getCartItems()).toEqual([]);
	});

	it("adds items and computes total", async () => {
		const { addCartItem, cartTotal, getCartItemCount } = await import("./cart");

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

	it("notifies subscribers on change", async () => {
		const { addCartItem, subscribeCart } = await import("./cart");
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
});
