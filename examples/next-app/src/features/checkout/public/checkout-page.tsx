"use client";

import { cartItemCount, cartTotal } from "@/services/cart/public/cart";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/ui/button";
import { checkoutStore } from "../checkout.store";
import styles from "./checkout-page.module.css";

export const CheckoutPage = () => (
  <section aria-labelledby="checkout-heading" className={styles.checkout}>
    <h2 id="checkout-heading">Checkout</h2>
    <p className={styles.total}>
      Cart total: <strong>{formatCurrency(cartTotal())}</strong>
    </p>
    <p className={styles.meta}>Line items: {cartItemCount()}</p>
    <p className={styles.meta}>
      Shipping selected: {checkoutStore.shippingSelected ? "yes" : "no"}
    </p>
    <Button label="Pay now" />
  </section>
);
