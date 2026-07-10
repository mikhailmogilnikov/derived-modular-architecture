<script setup lang="ts">
withDefaults(
	defineProps<{
		label: string;
		disabled?: boolean;
		variant?: "primary" | "secondary";
	}>(),
	{
		disabled: false,
		variant: "primary",
	},
);
</script>

<template>
  <button
    type="button"
    class="dma-button"
    :class="`dma-button--${variant}`"
    :disabled="disabled"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.dma-button {
	padding: 0.5rem 1rem;
	border-radius: 0.375rem;
	border: 1px solid transparent;
	font: inherit;
	cursor: pointer;
}

.dma-button--primary {
	border-color: #2563eb;
	background: #2563eb;
	color: #fff;
}

.dma-button--primary:hover {
	background: #1d4ed8;
	border-color: #1d4ed8;
}

.dma-button--secondary {
	border-color: #cbd5e1;
	background: #fff;
	color: #0f172a;
}

.dma-button--secondary:hover {
	background: #f8fafc;
}

.dma-button:disabled {
	opacity: 0.55;
	cursor: not-allowed;
}
</style>
