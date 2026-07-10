"use client";

import { Button } from "@/shared/ui/button";
import { searchStore } from "../search.store";

export const SearchPage = () => (
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">Search</h2>
    <label htmlFor="search-input">Find products</label>
    <input id="search-input" placeholder="Type to search…" type="search" />
    <p>Recent: {searchStore.recentQueries.join(", ")}</p>
    <Button label="Search" />
  </section>
);
