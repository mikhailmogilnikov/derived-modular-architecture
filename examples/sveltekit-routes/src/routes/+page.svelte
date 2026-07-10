<script lang="ts">
import CatalogPage from "@/features/catalog/public/catalog-page.svelte";
import CheckoutPage from "@/features/checkout/public/checkout-page.svelte";
import Profile from "@/features/profile.svelte";
import Promo from "@/features/promo.svelte";
</script>

<svelte:head>
  <title>DMA — SvelteKit mini-shop</title>
</svelte:head>

<div class="page">
  <header class="header">
    <h1>DMA SvelteKit example</h1>
    <p class="lede">
      Composition root: <code>src/routes/</code> mounts feature public APIs; wiring
      lives in <code>app-providers.svelte</code>.
    </p>
    <nav aria-label="Shop sections" class="nav">
      <a class="nav-link" href="#catalog">Catalog</a>
      <a class="nav-link" href="#checkout">Checkout</a>
      <a class="nav-link" href="#profile">Profile</a>
      <a class="nav-link" href="#promo">Promo</a>
    </nav>
  </header>

  <main class="main">
    <CatalogPage />
    <CheckoutPage />
    <Profile />
    <Promo />
  </main>
</div>

<style>
  .page {
    margin: 0 auto;
    max-width: 40rem;
    padding: 1.5rem;
  }

  .header {
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  .lede {
    color: var(--color-muted);
    margin: 0.5rem 0 1rem;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .nav-link {
    color: var(--color-accent);
    font-weight: 500;
    text-decoration: none;
  }

  .nav-link:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }

  .main {
    display: grid;
    gap: 1.5rem;
  }
</style>
