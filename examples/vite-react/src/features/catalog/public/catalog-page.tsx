import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  addCartItem,
  getCartItems,
  subscribeCart,
} from "@/services/cart/public/cart";
import { classNames } from "@/shared/lib/class-names";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Product } from "@/shared/model/product";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { fetchCatalogProducts } from "../catalog.api";
import {
  type CatalogCategory,
  getCatalogCategory,
  getCatalogSearchQuery,
  setCatalogCategory,
  setCatalogSearchQuery,
  subscribeCatalog,
} from "../catalog.store";
import styles from "./catalog-page.module.css";

type CatalogPageProps = {
  onAddedToCart?: (productName: string) => void;
};

const categories: { id: CatalogCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "merch", label: "Merch" },
];

const matchesFilters = (
  product: Product,
  category: CatalogCategory,
  query: string
): boolean => {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesCategory = category === "all" || product.category === category;
  const matchesQuery =
    normalizedQuery.length === 0 ||
    product.name.toLowerCase().includes(normalizedQuery);

  return matchesCategory && matchesQuery;
};

export const CatalogPage = ({ onAddedToCart }: CatalogPageProps) => {
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [loading, setLoading] = useState(true);
  const category = useSyncExternalStore(subscribeCatalog, getCatalogCategory);
  const searchQuery = useSyncExternalStore(
    subscribeCatalog,
    getCatalogSearchQuery
  );
  const cartItems = useSyncExternalStore(subscribeCart, getCartItems);

  useEffect(() => {
    let cancelled = false;

    fetchCatalogProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        matchesFilters(product, category, searchQuery)
      ),
    [category, products, searchQuery]
  );

  const handleAdd = (product: Product) => {
    const alreadyInCart = cartItems.some((item) => item.id === product.id);
    if (!alreadyInCart) {
      addCartItem(product);
      onAddedToCart?.(product.name);
    }
  };

  return (
    <section aria-labelledby="catalog-heading">
      <header>
        <h2 id="catalog-heading">Catalog</h2>
        <p>Browse products and add them to the cart service.</p>
      </header>

      <div className={styles.toolbar}>
        <Input
          id="catalog-search"
          label="Search"
          onChange={setCatalogSearchQuery}
          placeholder="Filter by name…"
          value={searchQuery}
        />

        <div aria-label="Category" className={styles.filters} role="group">
          {categories.map(({ id, label }) => (
            <button
              aria-pressed={category === id}
              className={classNames(
                styles.filter,
                category === id && styles.filterActive
              )}
              key={id}
              onClick={() => setCatalogCategory(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {loading ? (
          <li>
            <p role="status">Loading catalog…</p>
          </li>
        ) : null}
        {loading
          ? null
          : visibleProducts.map((product) => {
              const inCart = cartItems.some((item) => item.id === product.id);

              return (
                <li key={product.id}>
                  <Card>
                    <header className={styles.cardHeader}>
                      <h3>{product.name}</h3>
                      <Badge variant="accent">{product.category}</Badge>
                    </header>
                    <p className={styles.price}>
                      {formatCurrency(product.price)}
                    </p>
                    <Button
                      disabled={inCart}
                      label={inCart ? "In cart" : "Add to cart"}
                      onClick={() => handleAdd(product)}
                    />
                  </Card>
                </li>
              );
            })}
      </ul>

      {!loading && visibleProducts.length === 0 ? (
        <p role="status">No products match your filters.</p>
      ) : null}
    </section>
  );
};
