<script setup lang="ts">
withDefaults(
	defineProps<{
		variant?: "default" | "accent";
	}>(),
	{
		variant: "default",
	},
);
</script>

<template>
  <span class="ui-badge" :class="variant === 'accent' ? 'ui-badge--accent' : undefined">
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
	display: inline-block;
	padding: 0.125rem 0.5rem;
	border-radius: 9999px;
	background: #f1f5f9;
	color: #475569;
	font-size: 0.75rem;
	font-weight: 600;
}

.ui-badge--accent {
	background: #dbeafe;
	color: #1d4ed8;
}
</style>
