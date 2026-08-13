import type { CatalogItem, CatalogReader } from "../shared/catalog-item.js";
import { GET_PRODUCT_VARIANTS } from "./queries/get-product-variants.js";
import { isRecord } from "./shopify-client.js";
import { ShopifyVariantMapper } from "./shopify-variant-mapper.js";

interface GraphqlClient {
  graphql(query: string, variables: Record<string, unknown>): Promise<{ data?: unknown; errors?: unknown }>;
}

export class ShopifyCatalogService implements CatalogReader {
  constructor(private readonly client: GraphqlClient, private readonly mapper: ShopifyVariantMapper) {}

  async read(): Promise<CatalogItem[]> {
    const variants = await this.readVariants();
    return variants.flatMap((variant) => { const item = this.mapper.map(variant); return item ? [item] : []; });
  }

  async readVariants(): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    let after: string | null = null;
    do {
      const payload = await this.client.graphql(GET_PRODUCT_VARIANTS, { first: 250, after });
      const data = isRecord(payload.data) ? payload.data : null;
      const connection = data && isRecord(data.productVariants) ? data.productVariants : null;
      if (!connection || !Array.isArray(connection.nodes) || !isRecord(connection.pageInfo)) {
        throw new Error("Shopify response is missing productVariants.");
      }
      for (const variant of connection.nodes) {
        if (isRecord(variant)) items.push(variant);
      }
      const hasNextPage = connection.pageInfo.hasNextPage === true;
      after = typeof connection.pageInfo.endCursor === "string" ? connection.pageInfo.endCursor : null;
      if (!hasNextPage) break;
      if (!after) throw new Error("Shopify pagination is missing an end cursor.");
    } while (true);
    return items;
  }
}
