import { describe, expect, test } from "bun:test";
import { DEFAULT_THRESHOLDS } from "../../src/core/thresholds";

describe("thresholds", () => {
  test("exports second-use default of 2", () => {
    expect(DEFAULT_THRESHOLDS.sharedCandidateConsumers).toBe(2);
  });
});
