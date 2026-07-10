import { writable } from "svelte/store";
import { emitCheckoutCompleted } from "./public/checkout.events";

export const checkoutStore = writable({
  status: "idle" as "idle" | "paid",
});

export function markCheckoutPaid(): void {
  checkoutStore.update((state) => ({ ...state, status: "paid" }));
  emitCheckoutCompleted({ orderId: `ord-${Date.now()}` });
}
