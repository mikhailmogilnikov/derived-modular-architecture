<script lang="ts">
import {
  cartItemCount,
  cartItems,
  cartTotal,
} from "@/services/cart/public/cart";
import { formatCurrency } from "@/shared/lib/format-currency";
import Button from "@/shared/ui/button.svelte";
import Card from "@/shared/ui/card.svelte";
import { checkoutStore, markCheckoutPaid } from "../checkout.store";
import "../checkout.css";
</script>

<section class="checkout" id="checkout">
  <h2>Checkout</h2>

  {#if $cartItems.length === 0}
    <p class="empty">Cart is empty — add items from the catalog.</p>
  {:else}
    <ul class="cart-lines">
      {#each $cartItems as item (item.id)}
        <li>
          {item.name} × {item.qty} — {formatCurrency(item.price * item.qty)}
        </li>
      {/each}
    </ul>
    <p class="meta">Items in cart: {$cartItemCount}</p>
    <p class="total">Total: {formatCurrency($cartTotal)}</p>
  {/if}

  <p class="status" data-status={$checkoutStore.status}>
    Status: {$checkoutStore.status}
  </p>

  <Card title="Payment">
    <Button label="Pay" onclick={markCheckoutPaid} />
  </Card>
</section>

<style>
  .checkout {
    display: grid;
    gap: 0.75rem;
  }

  .cart-lines {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cart-lines li {
    margin: 0.25rem 0;
  }

  .empty,
  .meta,
  .status {
    color: var(--color-muted);
    font-size: 0.875rem;
    margin: 0;
  }

  .total {
    font-weight: 600;
    margin: 0;
  }
</style>
