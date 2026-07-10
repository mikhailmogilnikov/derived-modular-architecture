import { describe, expect, test } from "bun:test";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  test("formats cents as dollars", () => {
    expect(formatCurrency(2900)).toBe("$29.00");
    expect(formatCurrency(150)).toBe("$1.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
