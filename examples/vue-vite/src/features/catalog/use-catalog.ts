import { type CatalogCategory, catalogStore } from "./catalog.store";

export const useCatalog = () => {
	const setCategory = (next: CatalogCategory): void => {
		catalogStore.category = next;
	};

	const setSearchQuery = (next: string): void => {
		catalogStore.searchQuery = next;
	};

	return {
		category: () => catalogStore.category,
		searchQuery: () => catalogStore.searchQuery,
		setCategory,
		setSearchQuery,
	};
};
