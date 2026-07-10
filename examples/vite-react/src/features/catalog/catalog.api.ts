import { get } from "@/shared/api/http";
import type { Product } from "@/shared/model/product";

export const fetchCatalogProducts = (): Promise<readonly Product[]> =>
  get<readonly Product[]>("/catalog.json");
