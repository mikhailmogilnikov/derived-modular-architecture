import { describe, expect, test } from "bun:test";
import { addToCart, cartItemCount, cartTotal } from "./cart";
import { provideCartSeed } from "./ports";

describe("cart", () => {
	test("initializes from the bound seed port", () => {
		provideCartSeed({
			getInitialItems: () => [{ id: "seed", name: "Seed item", price: 5 }],
		});

		expect(cartItemCount()).toBe(1);
		expect(cartTotal()).toBe(5);
	});

	test("addToCart increases count and total", () => {
		const beforeCount = cartItemCount();
		const beforeTotal = cartTotal();

		addToCart({ id: "test", name: "Test item", price: 10 });

		expect(cartItemCount()).toBe(beforeCount + 1);
		expect(cartTotal()).toBe(beforeTotal + 10);
	});
});
