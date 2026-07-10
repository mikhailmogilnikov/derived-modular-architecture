import { writable } from "svelte/store";

export const catalogStore = writable({
  searchQuery: "",
});

export function setCatalogSearchQuery(searchQuery: string): void {
  catalogStore.update((state) => ({ ...state, searchQuery }));
}
