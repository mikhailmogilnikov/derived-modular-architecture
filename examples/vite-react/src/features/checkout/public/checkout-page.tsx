import { useState, useSyncExternalStore } from "react";
import {
  cartTotal,
  getCartItems,
  subscribeCart,
} from "@/services/cart/public/cart";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  getShippingLabel,
  getShippingMethod,
  type ShippingMethod,
  setShippingMethod,
  subscribeCheckout,
} from "../checkout.store";
import "./checkout-page.css";

export const CheckoutPage = () => {
  const items = useSyncExternalStore(subscribeCart, getCartItems);
  const shipping = useSyncExternalStore(subscribeCheckout, getShippingMethod);
  const [paid, setPaid] = useState(false);
  const total = cartTotal();

  const handlePay = () => {
    setPaid(true);
  };

  return (
    <section aria-labelledby="checkout-heading">
      <header>
        <h2 id="checkout-heading">Checkout</h2>
        <p>Review your cart and complete payment.</p>
      </header>

      <Card className="checkout-cart">
        <h3>Cart</h3>
        {items.length === 0 ? (
          <p>Your cart is empty. Add items from the catalog.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="checkout-summary">
          <p>
            <strong>Items:</strong> {items.length}
          </p>
          <p>
            <strong>Total:</strong> {formatCurrency(total)}
          </p>
        </div>
      </Card>

      <fieldset>
        <legend>Shipping</legend>
        {(
          ["standard", "express"] as const satisfies readonly ShippingMethod[]
        ).map((method) => (
          <label key={method}>
            <input
              checked={shipping === method}
              name="shipping"
              onChange={() => setShippingMethod(method)}
              type="radio"
              value={method}
            />
            {getShippingLabel(method)}
          </label>
        ))}
      </fieldset>

      <footer className="checkout-footer">
        <Button
          disabled={paid || items.length === 0}
          label={paid ? "Paid" : `Pay ${formatCurrency(total)}`}
          onClick={handlePay}
        />
        {paid ? (
          <p className="checkout-status" role="status">
            Payment received. Thank you!
          </p>
        ) : null}
      </footer>
    </section>
  );
};
