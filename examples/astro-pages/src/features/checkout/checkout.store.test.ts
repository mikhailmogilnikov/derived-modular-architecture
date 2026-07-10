import { describe, expect, test } from "bun:test";
import { checkoutStore } from "./checkout.store";

describe("checkoutStore", () => {
	test("starts on the review step", () => {
		expect(checkoutStore.step).toBe("review");
	});
});
