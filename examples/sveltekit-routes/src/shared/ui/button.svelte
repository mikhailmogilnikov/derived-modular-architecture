<script lang="ts">
let {
  label,
  onclick,
}: {
  label: string;
  onclick?: () => void;
} = $props();
</script>

<button class="button" type="button" {onclick}>
  {label}
</button>

<style>
  .button {
    background: var(--color-button-bg);
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-button-text);
    cursor: pointer;
    font: inherit;
    padding: 0.5rem 1rem;
  }

  .button:hover {
    background: var(--color-button-hover);
  }
</style>
