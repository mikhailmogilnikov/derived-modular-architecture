import { beforeEach, describe, expect, it } from "vitest";
import { effectScope } from "vue";
import { catalogStore } from "./catalog.store";
import { useCatalogSearch } from "./use-catalog-search";

describe("useCatalogSearch", () => {
	beforeEach(() => {
		catalogStore.category = "all";
		catalogStore.searchQuery = "";
	});

	it("filters by category", () => {
		const scope = effectScope();

		scope.run(() => {
			catalogStore.category = "books";
			const { visibleProducts } = useCatalogSearch();

			expect(visibleProducts.value.length).toBeGreaterThan(0);
			expect(
				visibleProducts.value.every((product) => product.category === "books"),
			).toBe(true);
		});

		scope.stop();
	});

	it("filters by search query", () => {
		const scope = effectScope();

		scope.run(() => {
			catalogStore.searchQuery = "poster";
			const { visibleProducts } = useCatalogSearch();

			expect(visibleProducts.value).toHaveLength(1);
			expect(visibleProducts.value[0]?.name).toBe("Module Poster");
		});

		scope.stop();
	});
});
