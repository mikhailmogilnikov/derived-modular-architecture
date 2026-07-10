export type ShippingMethod = "standard" | "express";

const shippingLabels: Record<ShippingMethod, string> = {
  express: "Express (next day)",
  standard: "Standard (3–5 days)",
};

let shipping: ShippingMethod = "standard";
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeCheckout = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getShippingMethod = (): ShippingMethod => shipping;

export const getShippingLabel = (method: ShippingMethod): string =>
  shippingLabels[method];

export const setShippingMethod = (method: ShippingMethod): void => {
  shipping = method;
  notify();
};
