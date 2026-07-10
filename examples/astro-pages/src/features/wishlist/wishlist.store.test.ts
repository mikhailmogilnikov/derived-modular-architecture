import { describe, expect, test } from "bun:test";
import { wishlistStore } from "./wishlist.store";

describe("wishlistStore", () => {
	test("exposes seeded saved ids", () => {
		expect(wishlistStore.savedIds).toEqual(["sku-1", "sku-2"]);
	});
});
