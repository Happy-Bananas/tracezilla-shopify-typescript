import type { CatalogItem, CatalogReader } from "../shared/catalog-item.js";
import { isRecord } from "../shopify/shopify-client.js";
import { TracezillaSkuMapper } from "./tracezilla-sku-mapper.js";

interface JsonGetClient {
  get(path: string, query: Record<string, string | number>): Promise<unknown>;
}

export class TracezillaCatalogService implements CatalogReader {
  constructor(private readonly client: JsonGetClient, private readonly mapper: TracezillaSkuMapper) {}

  async read(): Promise<CatalogItem[]> {
    const items: CatalogItem[] = [];
    let query: Record<string, string | number> = { sortBy: "sku_code", sortDirection: "asc", perPage: 250 };
    const visited = new Set<string>();
    do {
      const payload = await this.client.get("skus", query);
      if (!isRecord(payload) || !Array.isArray(payload.data)) throw new Error("tracezilla response is missing SKU data.");
      for (const value of payload.data) {
        const item = this.mapper.map(value);
        if (item) items.push(item);
      }
      const links = isRecord(payload.links) ? payload.links : null;
      const nextPage = links && typeof links.next_page === "string" ? links.next_page : null;
      if (!nextPage) break;
      const nextUrl = new URL(nextPage);
      const nextQuery = Object.fromEntries(nextUrl.searchParams.entries());
      if (Object.keys(nextQuery).length === 0) throw new Error("tracezilla returned no next-page parameters.");
      query = { ...query, ...nextQuery };
      const fingerprint = JSON.stringify(Object.entries(query).sort());
      if (visited.has(fingerprint)) throw new Error("tracezilla returned the same next page repeatedly.");
      visited.add(fingerprint);
    } while (true);
    return items;
  }
}
