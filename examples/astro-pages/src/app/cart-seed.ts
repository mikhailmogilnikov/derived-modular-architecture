import type { CartSeedPort } from "@/services/cart/public/ports";

export const demoCartSeed: CartSeedPort = {
	getInitialItems: () => [{ id: "sku-1", name: "DMA Handbook", price: 29 }],
};
