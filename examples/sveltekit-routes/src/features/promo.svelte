<script lang="ts">
import { formatCurrency } from "@/shared/lib/format-currency";
import Card from "@/shared/ui/card.svelte";

const freeShippingThreshold = 25;
const promoSavings = 3.5;
</script>

<section class="promo" id="promo">
  <Card title="Promo">
    <p>
      Free shipping on orders over {formatCurrency(freeShippingThreshold)} — save
      {formatCurrency(promoSavings)} on your first order.
    </p>
  </Card>
</section>
