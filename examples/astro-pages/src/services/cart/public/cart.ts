import type { CartItem } from "./cart.types";
import { getCartSeed } from "./ports";

let items: CartItem[] = [];
let initialized = false;

const ensureCart = (): void => {
	if (initialized) {
		return;
	}
	items = [...getCartSeed().getInitialItems()];
	initialized = true;
};

export const initCart = (): void => {
	ensureCart();
};

export const getCartItems = (): readonly CartItem[] => {
	ensureCart();
	return items;
};

export const addToCart = (item: CartItem): void => {
	ensureCart();
	items = [...items, item];
};

export const cartTotal = (): number => {
	ensureCart();
	return items.reduce((sum, item) => sum + item.price, 0);
};

export const cartItemCount = (): number => {
	ensureCart();
	return items.length;
};
