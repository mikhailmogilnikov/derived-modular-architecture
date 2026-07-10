import type { Product } from "@/shared/domain/product";

export const catalogStore: { products: Product[] } = {
  products: [
    { id: "p-1", name: "DMA Handbook", priceCents: 2900 },
    { id: "p-2", name: "Modular mug", priceCents: 1500 },
    { id: "p-3", name: "Layer poster", priceCents: 900 },
  ],
};
