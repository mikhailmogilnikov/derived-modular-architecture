<script setup lang="ts">
import { formatCurrency } from "@/shared/lib/format-currency";
import Button from "@/shared/ui/button.vue";
import Card from "@/shared/ui/card.vue";
import { checkoutStore } from "../checkout.store";
import { useCheckout } from "../use-checkout";

const { getShippingLabel, items, setPaid, setShippingMethod, total } =
	useCheckout();

const shippingMethods = ["standard", "express"] as const;

function handlePay(): void {
	setPaid(true);
}
</script>

<template>
  <section class="checkout" aria-labelledby="checkout-heading">
    <header>
      <h2 id="checkout-heading">Checkout</h2>
      <p>Review your cart and complete payment.</p>
    </header>

    <Card>
      <h3>Cart</h3>
      <p v-if="items.length === 0">Your cart is empty. Add items from the catalog.</p>
      <ul v-else class="checkout-items">
        <li v-for="item in items" :key="item.id">
          <span>{{ item.name }}</span>
          <span>{{ formatCurrency(item.price) }}</span>
        </li>
      </ul>
      <p><strong>Items:</strong> {{ items.length }}</p>
      <p><strong>Total:</strong> {{ formatCurrency(total) }}</p>
    </Card>

    <fieldset class="checkout-shipping">
      <legend>Shipping</legend>
      <label v-for="method in shippingMethods" :key="method">
        <input
          type="radio"
          name="shipping"
          :value="method"
          :checked="checkoutStore.shippingMethod === method"
          @change="setShippingMethod(method)"
        />
        {{ getShippingLabel(method) }}
      </label>
    </fieldset>

    <footer>
      <Button
        :disabled="checkoutStore.paid || items.length === 0"
        :label="checkoutStore.paid ? 'Paid' : `Pay ${formatCurrency(total)}`"
        :variant="checkoutStore.paid ? 'secondary' : 'primary'"
        @click="handlePay"
      />
      <p v-if="checkoutStore.paid" role="status">Payment received. Thank you!</p>
    </footer>
  </section>
</template>

<style scoped>
.checkout-items {
	margin: 0.75rem 0;
	padding: 0;
	list-style: none;
}

.checkout-items li {
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	padding: 0.25rem 0;
}

.checkout-shipping {
	margin: 1rem 0;
	padding: 0.75rem;
	border: 1px solid var(--color-border);
	border-radius: 0.375rem;
}

.checkout-shipping label {
	display: block;
	margin-top: 0.5rem;
}
</style>
