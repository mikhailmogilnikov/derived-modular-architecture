<script setup lang="ts">
import "./app.css";
import { onScopeDispose, ref, shallowRef } from "vue";
import AppProviders from "@/app/AppProviders.vue";
import CatalogPage from "@/features/catalog/public/catalog-page.vue";
import CheckoutPage from "@/features/checkout/public/checkout-page.vue";
import {
	addNotification,
	getUnreadCount,
	subscribeNotifications,
} from "@/features/notifications/public/notifications-api";
import NotificationsPanel from "@/features/notifications/public/notifications-panel.vue";
import Profile from "@/features/profile.vue";
import { getCartItemCount, subscribeCart } from "@/services/cart/public/cart";
import Badge from "@/shared/ui/badge.vue";

type Section = "catalog" | "checkout" | "notifications" | "profile";

const section = ref<Section>("catalog");
const cartCount = shallowRef(getCartItemCount());
const unreadCount = shallowRef(getUnreadCount());

const unsubscribeCart = subscribeCart(() => {
	cartCount.value = getCartItemCount();
});

const unsubscribeNotifications = subscribeNotifications(() => {
	unreadCount.value = getUnreadCount();
});

onScopeDispose(() => {
	unsubscribeCart();
	unsubscribeNotifications();
});

const sections: { id: Section; label: string }[] = [
	{ id: "catalog", label: "Catalog" },
	{ id: "checkout", label: "Checkout" },
	{ id: "notifications", label: "Notifications" },
	{ id: "profile", label: "Profile" },
];

function handleAddedToCart(productName: string): void {
	addNotification(`Added “${productName}” to cart`);
}
</script>

<template>
  <AppProviders>
    <div class="shop">
      <header class="shop-header">
        <div class="shop-header__inner">
          <div class="shop-header__title-row">
            <div>
              <h1 class="shop-header__title">DMA mini-shop</h1>
              <p class="shop-header__subtitle">
                Composition root at <code>src/app/</code> — mounts only feature public APIs.
              </p>
            </div>
            <div class="shop-header__status">
              <Badge v-if="cartCount > 0" variant="accent">{{ cartCount }} in cart</Badge>
              <Badge v-if="unreadCount > 0">{{ unreadCount }} unread</Badge>
            </div>
          </div>

          <nav class="shop-nav" aria-label="Shop sections">
            <button
              v-for="{ id, label } in sections"
              :key="id"
              type="button"
              class="shop-nav__button"
              :aria-current="section === id ? 'page' : undefined"
              @click="section = id"
            >
              {{ label }}
            </button>
          </nav>
        </div>
      </header>

      <main class="shop-main">
        <CatalogPage
          v-if="section === 'catalog'"
          @added-to-cart="handleAddedToCart"
        />
        <CheckoutPage v-else-if="section === 'checkout'" />
        <NotificationsPanel v-else-if="section === 'notifications'" />
        <Profile v-else-if="section === 'profile'" />
      </main>
    </div>
  </AppProviders>
</template>

<style scoped>
.shop {
	min-height: 100vh;
}

.shop-header {
	padding: 1.5rem 1.25rem;
	border-bottom: 1px solid var(--color-border);
	background: var(--color-panel);
}

.shop-header__inner {
	max-width: 48rem;
	margin: 0 auto;
}

.shop-header__title-row {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
}

.shop-header__title {
	margin: 0 0 0.25rem;
	font-size: 1.5rem;
}

.shop-header__subtitle {
	margin: 0;
	color: var(--color-muted);
}

.shop-header__status {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.shop-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.shop-nav__button {
	padding: 0.375rem 0.75rem;
	border: 1px solid var(--color-border);
	border-radius: 0.375rem;
	background: var(--color-panel);
	font: inherit;
	cursor: pointer;
}

.shop-nav__button[aria-current="page"] {
	border-color: var(--color-accent);
	background: var(--color-accent-soft);
	color: #1d4ed8;
	font-weight: 600;
}

.shop-main {
	max-width: 48rem;
	margin: 0 auto;
	padding: 1.25rem;
}
</style>
