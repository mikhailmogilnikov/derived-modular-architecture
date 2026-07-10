import type { Money } from "@/shared/model/product";

export const formatCurrency = (amount: Money): string =>
	new Intl.NumberFormat(undefined, {
		currency: "USD",
		style: "currency",
	}).format(amount);
