import { GET_LOCATIONS } from "./queries/get-locations.js";
import { isRecord } from "./shopify-client.js";
import type { ShopifyLocation } from "./shopify-location.js";
import { ShopifyLocationMapper } from "./shopify-location-mapper.js";

interface GraphqlClient { graphql(query: string, variables: Record<string, unknown>): Promise<{ data?: unknown }> }

export class ShopifyLocationService {
  constructor(private readonly client: GraphqlClient, private readonly mapper: ShopifyLocationMapper) {}
  async read(): Promise<ShopifyLocation[]> {
    const locations: ShopifyLocation[] = []; let after: string | null = null; const seen = new Set<string>();
    do {
      const payload = await this.client.graphql(GET_LOCATIONS, { first: 250, after });
      const data = isRecord(payload.data) ? payload.data : null;
      const connection = data && isRecord(data.locations) ? data.locations : null;
      if (!connection || !Array.isArray(connection.nodes) || !isRecord(connection.pageInfo)) throw new Error("Shopify response is missing locations.");
      for (const location of connection.nodes) {
        if (!isRecord(location)) throw new Error("Shopify returned an invalid location.");
        locations.push(this.mapper.map(location));
      }
      if (typeof connection.pageInfo.hasNextPage !== "boolean") throw new Error("Shopify returned invalid location pagination data.");
      if (!connection.pageInfo.hasNextPage) break;
      const cursor = connection.pageInfo.endCursor;
      if (typeof cursor !== "string" || !cursor || seen.has(cursor)) throw new Error("Shopify returned an invalid or repeated location cursor.");
      seen.add(cursor); after = cursor;
    } while (true);
    return locations;
  }
}
