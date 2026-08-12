import type { CatalogItem } from "../shared/catalog-item.js";
import { isRecord } from "../shopify/shopify-client.js";

export class TracezillaSkuMapper {
  map(value: unknown): CatalogItem | null {
    if (!isRecord(value)) return null;
    const sku = typeof value.sku_code === "string" ? value.sku_code.trim() : "";
    if (!sku) return null;
    const sourceId = value.id === undefined || value.id === null ? sku : String(value.id);
    const candidate = [value.name, value.sku_name, value.description].find((item) => typeof item === "string" && item.trim());
    const name = typeof candidate === "string" ? candidate.trim() : undefined;
    return name ? { sku, sourceId, name } : { sku, sourceId };
  }
}
