import { describe, expect, test } from "bun:test";
import { checkoutStore } from "./checkout.store";

describe("checkoutStore", () => {
  test("defaults shipping to selected", () => {
    expect(checkoutStore.shippingSelected).toBe(true);
  });
});
