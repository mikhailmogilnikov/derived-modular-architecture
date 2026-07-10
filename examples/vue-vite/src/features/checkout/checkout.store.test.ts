import { beforeEach, describe, expect, it } from "vitest";
import { checkoutStore, getShippingLabel } from "./checkout.store";

describe("checkoutStore", () => {
	beforeEach(() => {
		checkoutStore.paid = false;
		checkoutStore.shippingMethod = "standard";
	});

	it("tracks payment state", () => {
		expect(checkoutStore.paid).toBe(false);
		checkoutStore.paid = true;
		expect(checkoutStore.paid).toBe(true);
	});
});

describe("getShippingLabel", () => {
	it("returns labels for each method", () => {
		expect(getShippingLabel("standard")).toContain("Standard");
		expect(getShippingLabel("express")).toContain("Express");
	});
});
