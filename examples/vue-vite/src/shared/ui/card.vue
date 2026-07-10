<script setup lang="ts">
defineProps<{
	cardClass?: string;
}>();
</script>

<template>
  <article class="ui-card" :class="cardClass">
    <slot />
  </article>
</template>

<style scoped>
.ui-card {
	padding: 1rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	background: #fff;
}
</style>
