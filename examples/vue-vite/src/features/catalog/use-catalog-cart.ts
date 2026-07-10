import { onScopeDispose, shallowRef } from "vue";
import {
	addCartItem,
	getCartItems,
	subscribeCart,
} from "@/services/cart/public/cart";
import type { Product } from "@/shared/model/product";

export const useCatalogCart = () => {
	const cartItems = shallowRef<readonly Product[]>(getCartItems());

	const unsubscribe = subscribeCart(() => {
		cartItems.value = getCartItems();
	});

	onScopeDispose(unsubscribe);

	const addToCart = (product: Product): boolean => {
		const alreadyInCart = cartItems.value.some(
			(item) => item.id === product.id,
		);
		if (alreadyInCart) {
			return false;
		}

		addCartItem(product);
		return true;
	};

	return { addToCart, cartItems };
};
