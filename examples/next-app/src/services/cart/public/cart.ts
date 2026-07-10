import type { Product } from "@/shared/domain/product";

const items: Product[] = [
  { id: "seed-1", name: "Starter kit", priceCents: 1200 },
];

export const addToCart = (product: Product): void => {
  items.push(product);
};

export const cartItemCount = (): number => items.length;

export const cartTotal = (): number =>
  items.reduce((sum, item) => sum + item.priceCents, 0);
