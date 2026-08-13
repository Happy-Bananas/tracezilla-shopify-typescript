import { isRecord } from "./shopify-client.js";
import type { ShopifyLocation } from "./shopify-location.js";

export class ShopifyLocationMapper {
  map(value: Record<string, unknown>): ShopifyLocation {
    const requiredString = (key: string): string => {
      const field = value[key];
      if ((typeof field !== "string" && typeof field !== "number") || !String(field).trim()) throw new Error(`Shopify location field [${key}] is required.`);
      return String(field).trim();
    };
    const requiredBoolean = (key: string): boolean => {
      if (typeof value[key] !== "boolean") throw new Error(`Shopify location field [${key}] must be boolean.`);
      return value[key];
    };
    const address = value.address === null || value.address === undefined ? {} : value.address;
    if (!isRecord(address)) throw new Error("Shopify location address must be an object.");
    const optional = (key: string): string | null => {
      const field = address[key];
      return (typeof field === "string" || typeof field === "number") && String(field).trim() ? String(field).trim() : null;
    };
    return {
      graph_ql_id: requiredString("id"), legacy_id: requiredString("legacyResourceId"), name: requiredString("name"),
      is_active: requiredBoolean("isActive"), has_active_inventory: requiredBoolean("hasActiveInventory"),
      fulfills_online_orders: requiredBoolean("fulfillsOnlineOrders"),
      address: { address1: optional("address1"), address2: optional("address2"), city: optional("city"), province: optional("province"), country: optional("country"), zip: optional("zip") },
    };
  }
}
