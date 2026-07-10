import type { Product } from "@/shared/model/product";

const listeners = new Set<() => void>();

let items: Product[] = [];

const notify = (): void => {
	for (const listener of listeners) {
		listener();
	}
};

export const subscribeCart = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

export const getCartItems = (): readonly Product[] => items;

export const getCartItemCount = (): number => items.length;

export const cartTotal = (): number =>
	items.reduce((sum, item) => sum + item.price, 0);

export const addCartItem = (item: Product): void => {
	items = [...items, item];
	notify();
};

export type { Product as CartItem } from "@/shared/model/product";
