import { describe, expect, test } from "bun:test";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
	test("formats amounts as USD", () => {
		expect(formatCurrency(12.5)).toBe("$12.50");
		expect(formatCurrency(0)).toBe("$0.00");
	});
});
