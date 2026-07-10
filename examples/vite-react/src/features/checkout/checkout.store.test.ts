import { afterEach, describe, expect, it } from "vitest";
import {
  getShippingLabel,
  getShippingMethod,
  setShippingMethod,
} from "./checkout.store";

afterEach(() => {
  setShippingMethod("standard");
});

describe("checkout store", () => {
  it("tracks shipping method", () => {
    expect(getShippingMethod()).toBe("standard");

    setShippingMethod("express");
    expect(getShippingMethod()).toBe("express");
  });
});

describe("getShippingLabel", () => {
  it("returns labels for each method", () => {
    expect(getShippingLabel("standard")).toContain("Standard");
    expect(getShippingLabel("express")).toContain("Express");
  });
});
