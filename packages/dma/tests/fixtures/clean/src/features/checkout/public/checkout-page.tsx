import { checkoutStore } from "@/features/checkout/checkout.store";
import { Button } from "@/shared/ui/button";

export const CheckoutPage = () => [Button, checkoutStore] as const;
