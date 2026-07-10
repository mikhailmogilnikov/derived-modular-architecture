import { computed } from "vue";
import type { Product } from "@/shared/model/product";
import { catalogProducts } from "./catalog.data";
import { catalogStore } from "./catalog.store";

const matchesFilters = (
	product: Product,
	category: typeof catalogStore.category,
	query: string,
): boolean => {
	const normalizedQuery = query.trim().toLowerCase();
	const matchesCategory = category === "all" || product.category === category;
	const matchesQuery =
		normalizedQuery.length === 0 ||
		product.name.toLowerCase().includes(normalizedQuery);

	return matchesCategory && matchesQuery;
};

export const useCatalogSearch = () => {
	const visibleProducts = computed(() =>
		catalogProducts.filter((product) =>
			matchesFilters(product, catalogStore.category, catalogStore.searchQuery),
		),
	);

	return { visibleProducts };
};
