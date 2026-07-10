type CheckoutCompletedPayload = {
  orderId: string;
};

type CheckoutCompletedListener = (payload: CheckoutCompletedPayload) => void;

const listeners = new Set<CheckoutCompletedListener>();

export function onCheckoutCompleted(
  listener: CheckoutCompletedListener
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function emitCheckoutCompleted(payload: CheckoutCompletedPayload): void {
  for (const listener of listeners) {
    listener(payload);
  }
}
