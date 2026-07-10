import { derived, writable } from "svelte/store";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export const cartItems = writable<CartItem[]>([
  { id: "sample", name: "Sample item", price: 9.99, qty: 1 },
]);

export const cartTotal = derived(cartItems, ($items) =>
  $items.reduce((sum, item) => sum + item.price * item.qty, 0)
);

export const cartItemCount = derived(cartItems, ($items) =>
  $items.reduce((sum, item) => sum + item.qty, 0)
);

export function addCartItem(item: {
  id: string;
  name: string;
  price: number;
  qty?: number;
}): void {
  const quantity = item.qty ?? 1;

  cartItems.update((items) => {
    const existing = items.find((entry) => entry.id === item.id);

    if (existing) {
      return items.map((entry) =>
        entry.id === item.id ? { ...entry, qty: entry.qty + quantity } : entry
      );
    }

    return [...items, { ...item, qty: quantity }];
  });
}

export function clearCart(): void {
  cartItems.set([]);
}
