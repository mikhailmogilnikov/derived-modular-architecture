import { describe, expect, test } from "bun:test";
import { catalogStore } from "./catalog.store";

describe("catalogStore", () => {
	test("defaults category filter to all", () => {
		expect(catalogStore.selectedCategory).toBe("all");
	});
});
