<script lang="ts">
import type { Snippet } from "svelte";
import { onCheckoutCompleted } from "@/features/checkout/public/checkout.events";
import { clearCart } from "@/services/cart/public/cart";

let { children }: { children: Snippet } = $props();

$effect(() => {
  const unsubscribe = onCheckoutCompleted(() => {
    clearCart();
  });

  return unsubscribe;
});
</script>

<div class="app-theme">
  {@render children()}
</div>

<style>
  .app-theme {
    --color-bg: #f8fafc;
    --color-text: #0f172a;
    --color-muted: #64748b;
    --color-border: #e2e8f0;
    --color-accent: #2563eb;
    --color-accent-hover: #1d4ed8;
    --color-surface: #ffffff;
    --color-button-bg: #0f172a;
    --color-button-hover: #1e293b;
    --color-button-text: #f8fafc;
    --color-success: #15803d;
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
  }
</style>
