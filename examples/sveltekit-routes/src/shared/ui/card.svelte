<script lang="ts">
import type { Snippet } from "svelte";

let {
  title,
  children,
}: {
  title: string;
  children?: Snippet;
} = $props();
</script>

<section class="card">
  <h3 class="card-title">{title}</h3>
  <div class="card-body">
    {@render children?.()}
  </div>
</section>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
  }

  .card-title {
    font-size: 1rem;
    margin: 0 0 0.75rem;
  }

  .card-body {
    color: var(--color-text);
  }
</style>
