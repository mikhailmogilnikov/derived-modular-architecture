import { get } from "@/shared/lib/http";
import type { Product } from "@/shared/model/product";

export const fetchCatalogProducts = (): Promise<readonly Product[]> =>
  get<readonly Product[]>("/catalog.json");
