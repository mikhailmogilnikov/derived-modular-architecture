import { reactive } from "vue";

export type CatalogCategory = "all" | "books" | "merch";

export const catalogStore = reactive({
	category: "all" as CatalogCategory,
	searchQuery: "",
});
