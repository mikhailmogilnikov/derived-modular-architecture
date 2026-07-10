<script setup lang="ts">
defineProps<{
	id: string;
	label: string;
	placeholder?: string;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <label class="ui-input" :for="id">
    <span class="ui-input__label">{{ label }}</span>
    <input
      :id="id"
      v-model="model"
      class="ui-input__field"
      type="search"
      :placeholder="placeholder"
    />
  </label>
</template>

<style scoped>
.ui-input {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.ui-input__label {
	font-size: 0.875rem;
	font-weight: 500;
	color: #334155;
}

.ui-input__field {
	padding: 0.5rem 0.75rem;
	border: 1px solid #cbd5e1;
	border-radius: 0.375rem;
	font: inherit;
}
</style>
