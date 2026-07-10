import { CatalogPage } from "@/features/catalog/public/catalog-page";
import { CheckoutPage } from "@/features/checkout/public/checkout-page";
import { Profile } from "@/features/profile";
import { SearchPage } from "@/features/search/public/search-page";

// Composition root: mount features via public APIs only (never feature internals).
export default function Page() {
  return (
    <div className="shop-grid">
      <CatalogPage />
      <SearchPage />
      <CheckoutPage />
      <Profile />
    </div>
  );
}
