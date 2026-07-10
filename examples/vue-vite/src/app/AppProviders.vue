<script setup lang="ts">
import { provide } from "vue";
import { shopThemeKey } from "@/shared/domain/shop-theme";

provide(shopThemeKey, {
	accentColor: "#2563eb",
});
</script>

<template>
  <slot />
</template>
