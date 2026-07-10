import { computed, onScopeDispose, shallowRef } from "vue";
import {
	cartTotal,
	getCartItems,
	subscribeCart,
} from "@/services/cart/public/cart";
import { checkoutStore, getShippingLabel } from "./checkout.store";

export const useCheckout = () => {
	const items = shallowRef(getCartItems());

	const unsubscribe = subscribeCart(() => {
		items.value = getCartItems();
	});

	onScopeDispose(unsubscribe);

	const total = computed(() => cartTotal());

	return {
		getShippingLabel,
		items,
		paid: () => checkoutStore.paid,
		setPaid: (next: boolean) => {
			checkoutStore.paid = next;
		},
		setShippingMethod: (method: typeof checkoutStore.shippingMethod) => {
			checkoutStore.shippingMethod = method;
		},
		shippingMethod: () => checkoutStore.shippingMethod,
		total,
	};
};
