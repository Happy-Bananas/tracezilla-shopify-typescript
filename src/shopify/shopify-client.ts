import type { Configuration } from "../configuration.js";
import { fetchJson } from "../shared/http.js";

interface TokenResponse { access_token?: unknown }
interface GraphqlResponse { data?: unknown; errors?: unknown }

export class ShopifyClient {
  private accessToken?: string;

  constructor(private readonly configuration: Configuration) {}

  async graphql(query: string, variables: Record<string, unknown>): Promise<GraphqlResponse> {
    const accessToken = await this.token();
    const { payload } = await fetchJson(
      `https://${this.configuration.shopifyShopUrl}/admin/api/${this.configuration.shopifyApiVersion}/graphql.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-Shopify-Access-Token": accessToken },
        body: JSON.stringify({ query, variables }),
      },
      this.configuration.timeoutMs,
      "Shopify",
    );
    if (!isRecord(payload)) throw new Error("Shopify returned an invalid GraphQL response.");
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      throw new Error("Shopify rejected the GraphQL query.");
    }
    return payload;
  }

  private async token(): Promise<string> {
    if (this.accessToken) return this.accessToken;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.configuration.shopifyClientId,
      client_secret: this.configuration.shopifyClientSecret,
      scope: this.configuration.shopifyScope,
    });
    const { payload } = await fetchJson(
      `https://${this.configuration.shopifyShopUrl}/admin/oauth/access_token`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body },
      this.configuration.timeoutMs,
      "Shopify authentication",
    );
    const token = isRecord(payload) ? (payload as TokenResponse).access_token : undefined;
    if (typeof token !== "string" || !token) throw new Error("Shopify authentication did not return an access token.");
    this.accessToken = token;
    return token;
  }
}

export function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
