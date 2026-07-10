import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it("formats USD amounts", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
