export type CatalogCategory = "all" | "books" | "merch";

let category: CatalogCategory = "all";
let searchQuery = "";
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeCatalog = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCatalogCategory = (): CatalogCategory => category;

export const getCatalogSearchQuery = (): string => searchQuery;

export const setCatalogCategory = (next: CatalogCategory): void => {
  category = next;
  notify();
};

export const setCatalogSearchQuery = (next: string): void => {
  searchQuery = next;
  notify();
};
