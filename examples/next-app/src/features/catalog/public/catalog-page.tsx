"use client";

import { addToCart, cartItemCount } from "@/services/cart/public/cart";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Button } from "@/shared/ui/button";
import { catalogStore } from "../catalog.store";
import styles from "./catalog-page.module.scss";

export const CatalogPage = () => (
  <section aria-labelledby="catalog-heading" className={styles.catalog}>
    <h2 id="catalog-heading">Catalog</h2>
    <p className={styles.cartBadge}>Items in cart: {cartItemCount()}</p>
    <ul className={styles.productList}>
      {catalogStore.products.map((product) => (
        <li className={styles.productItem} key={product.id}>
          <span>
            {product.name} — {formatCurrency(product.priceCents)}
          </span>
          <Button
            label="Add to cart"
            onClick={() => {
              addToCart(product);
            }}
          />
        </li>
      ))}
    </ul>
  </section>
);
