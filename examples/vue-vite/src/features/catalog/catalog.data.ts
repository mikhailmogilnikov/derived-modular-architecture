import type { Product } from "@/shared/model/product";

export const catalogProducts: readonly Product[] = [
	{ category: "books", id: "dma-handbook", name: "DMA Handbook", price: 29 },
	{
		category: "books",
		id: "modular-patterns",
		name: "Modular Patterns",
		price: 34,
	},
	{
		category: "merch",
		id: "lint-stickers",
		name: "Lint Stickers (×3)",
		price: 12,
	},
	{
		category: "merch",
		id: "module-poster",
		name: "Module Poster",
		price: 18,
	},
];
