import { reactive } from "vue";

export type ShippingMethod = "standard" | "express";

const shippingLabels: Record<ShippingMethod, string> = {
	express: "Express (next day)",
	standard: "Standard (3–5 days)",
};

export const checkoutStore = reactive({
	paid: false,
	shippingMethod: "standard" as ShippingMethod,
});

export const getShippingLabel = (method: ShippingMethod): string =>
	shippingLabels[method];
