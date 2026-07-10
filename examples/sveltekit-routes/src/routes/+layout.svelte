<script lang="ts">
import type { Snippet } from "svelte";
import "../app.css";
import AppProviders from "./app-providers.svelte";

let { children }: { children: Snippet } = $props();
</script>

<AppProviders>{@render children()}</AppProviders>
