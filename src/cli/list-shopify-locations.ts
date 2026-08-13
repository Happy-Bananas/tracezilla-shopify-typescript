import "dotenv/config";
import { configurationFromEnvironment } from "../configuration.js";
import { ShopifyClient } from "../shopify/shopify-client.js";
import { ShopifyLocationMapper } from "../shopify/shopify-location-mapper.js";
import { ShopifyLocationService } from "../shopify/shopify-location-service.js";
import { ListShopifyLocations } from "../workflows/list-shopify-locations.js";

try {
  const result = await new ListShopifyLocations(new ShopifyLocationService(new ShopifyClient(configurationFromEnvironment(process.env)), new ShopifyLocationMapper())).run();
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log("Name                     Status    Inventory  Online orders Legacy ID              GraphQL ID");
    console.log("-".repeat(112));
    for (const location of result.locations) {
      console.log(`${location.name.padEnd(24)} ${(location.is_active ? "Active" : "Inactive").padEnd(9)} ${(location.has_active_inventory ? "Yes" : "No").padEnd(10)} ${(location.fulfills_online_orders ? "Yes" : "No").padEnd(13)} ${location.legacy_id.padEnd(22)} ${location.graph_ql_id}`);
      const a = location.address; const address = [a.address1, a.address2, [a.zip, a.city].filter(Boolean).join(" "), a.province, a.country].filter(Boolean).join(", ");
      console.log(`Address: ${address || "—"}`);
    }
    console.log(`\n${result.count} location(s) returned.`); if (!result.count) console.log("No Shopify locations are available to this app.");
  }
} catch (error) { console.error(`Location listing failed: ${error instanceof Error ? error.message : "Unexpected error."}`); process.exitCode = 1; }
