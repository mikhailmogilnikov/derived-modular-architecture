export type ProductId = string;

/** Demo type — dollars, not cents. */
export type Money = number;

export type Product = {
  id: ProductId;
  name: string;
  price: Money;
  category: "books" | "merch";
};
