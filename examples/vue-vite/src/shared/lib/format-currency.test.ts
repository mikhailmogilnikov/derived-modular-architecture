import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
	it("formats USD amounts", () => {
		expect(formatCurrency(29)).toMatch(/\$29\.00/);
	});

	it("formats zero", () => {
		expect(formatCurrency(0)).toMatch(/\$0\.00/);
	});
});
