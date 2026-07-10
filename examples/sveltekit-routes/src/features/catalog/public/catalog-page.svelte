<script lang="ts">
import { addCartItem } from "@/services/cart/public/cart";
import { formatCurrency } from "@/shared/lib/format-currency";
import Button from "@/shared/ui/button.svelte";
import Card from "@/shared/ui/card.svelte";
import { catalogStore, setCatalogSearchQuery } from "../catalog.store";

const products = [
  { id: "tea", name: "Green tea", price: 4.5 },
  { id: "mug", name: "Ceramic mug", price: 12 },
  { id: "honey", name: "Wild honey", price: 8 },
] as const;

function handleSearchInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  setCatalogSearchQuery(target.value);
}

function addProduct(product: (typeof products)[number]) {
  addCartItem(product);
}
</script>

<section class="catalog" id="catalog">
  <h2>Catalog</h2>
  <label class="search">
    <span class="search-label">Search</span>
    <input
      class="search-input"
      oninput={handleSearchInput}
      placeholder="Filter products…"
      type="search"
      value={$catalogStore.searchQuery}
    />
  </label>

  <ul class="product-list">
    {#each products.filter((product) => product.name
          .toLowerCase()
          .includes($catalogStore.searchQuery.trim().toLowerCase())) as product (product.id)}
      <li>
        <Card title={product.name}>
          <p class="price">{formatCurrency(product.price)}</p>
          <Button
            label="Add to cart"
            onclick={() => {
              addProduct(product);
            }}
          />
        </Card>
      </li>
    {/each}
  </ul>
</section>

<style>
  .catalog {
    display: grid;
    gap: 1rem;
  }

  .search {
    display: grid;
    gap: 0.375rem;
  }

  .search-label {
    color: var(--color-muted);
    font-size: 0.875rem;
  }

  .search-input {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font: inherit;
    padding: 0.5rem 0.75rem;
  }

  .search-input:focus {
    border-color: var(--color-accent);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
    outline-offset: 1px;
  }

  .product-list {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .price {
    font-weight: 600;
    margin: 0 0 0.75rem;
  }
</style>
