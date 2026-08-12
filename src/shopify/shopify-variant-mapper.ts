import type { CatalogItem } from "../shared/catalog-item.js";
import { isRecord } from "./shopify-client.js";

export class ShopifyVariantMapper {
  map(value: unknown): CatalogItem | null {
    if (!isRecord(value)) return null;
    const sku = typeof value.sku === "string" ? value.sku.trim() : "";
    if (!sku) return null;
    if (typeof value.id !== "string" || !value.id) throw new Error("A Shopify variant is missing its ID.");
    const name = typeof value.displayName === "string" && value.displayName.trim() ? value.displayName.trim() : undefined;
    return name ? { sku, sourceId: value.id, name } : { sku, sourceId: value.id };
  }
}
