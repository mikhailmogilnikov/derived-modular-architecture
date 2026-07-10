<script setup lang="ts">
import { formatCurrency } from "@/shared/lib/format-currency";
import Badge from "@/shared/ui/badge.vue";
import Button from "@/shared/ui/button.vue";
import Card from "@/shared/ui/card.vue";
import Input from "@/shared/ui/input.vue";
import { catalogStore } from "../catalog.store";
import { useCatalog } from "../use-catalog";
import { useCatalogCart } from "../use-catalog-cart";
import { useCatalogSearch } from "../use-catalog-search";

const emit = defineEmits<{
	addedToCart: [productName: string];
}>();

const { setCategory } = useCatalog();
const { visibleProducts } = useCatalogSearch();
const { addToCart, cartItems } = useCatalogCart();

const categories = [
	{ id: "all" as const, label: "All" },
	{ id: "books" as const, label: "Books" },
	{ id: "merch" as const, label: "Merch" },
];

function handleAdd(product: (typeof visibleProducts.value)[number]): void {
	if (addToCart(product)) {
		emit("addedToCart", product.name);
	}
}

function isInCart(productId: string): boolean {
	return cartItems.value.some((item) => item.id === productId);
}
</script>

<template>
  <section class="catalog" aria-labelledby="catalog-heading">
    <header>
      <h2 id="catalog-heading">Catalog</h2>
      <p>Browse products and add them to the cart service.</p>
    </header>

    <div :class="$style.toolbar">
      <Input
        id="catalog-search"
        v-model="catalogStore.searchQuery"
        label="Search"
        placeholder="Filter by name…"
      />

      <div :class="$style.filters" aria-label="Category" role="group">
        <button
          v-for="{ id, label } in categories"
          :key="id"
          type="button"
          :class="catalogStore.category === id ? $style.filterActive : $style.filter"
          :aria-pressed="catalogStore.category === id"
          @click="setCategory(id)"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <ul :class="$style.grid">
      <li v-for="product in visibleProducts" :key="product.id">
        <Card>
          <header :class="$style.cardHeader">
            <h3>{{ product.name }}</h3>
            <Badge variant="accent">{{ product.category }}</Badge>
          </header>
          <p :class="$style.price">{{ formatCurrency(product.price) }}</p>
          <Button
            :label="isInCart(product.id) ? 'In cart' : 'Add to cart'"
            :variant="isInCart(product.id) ? 'secondary' : 'primary'"
            @click="handleAdd(product)"
          />
        </Card>
      </li>
    </ul>

    <p v-if="visibleProducts.length === 0" role="status">
      No products match your filters.
    </p>
  </section>
</template>

<style scoped>
.catalog header p {
	margin: 0.25rem 0 0;
	color: var(--color-muted);
}
</style>

<style module src="./catalog-page.module.css"></style>
