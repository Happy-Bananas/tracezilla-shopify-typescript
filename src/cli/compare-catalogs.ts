import "dotenv/config";
import { configurationFromEnvironment } from "../configuration.js";
import { renderTable } from "../output/table-renderer.js";
import { ShopifyCatalogService } from "../shopify/shopify-catalog-service.js";
import { ShopifyClient } from "../shopify/shopify-client.js";
import { ShopifyVariantMapper } from "../shopify/shopify-variant-mapper.js";
import { TracezillaCatalogService } from "../tracezilla/tracezilla-catalog-service.js";
import { TracezillaClient } from "../tracezilla/tracezilla-client.js";
import { TracezillaSkuMapper } from "../tracezilla/tracezilla-sku-mapper.js";
import { CompareCatalogs } from "../workflows/compare-catalogs.js";

try {
  const json = process.argv.includes("--json");
  const limitArgument = process.argv.find((argument) => argument.startsWith("--limit="));
  const displayLimit = limitArgument ? Number.parseInt(limitArgument.slice("--limit=".length), 10) : 10;
  const configuration = configurationFromEnvironment(process.env);
  const workflow = new CompareCatalogs(
    new ShopifyCatalogService(new ShopifyClient(configuration), new ShopifyVariantMapper()),
    new TracezillaCatalogService(new TracezillaClient(configuration), new TracezillaSkuMapper()),
  );
  const result = await workflow.run(displayLimit);
  console.log(json ? JSON.stringify({
    status: result.status,
    display_limit: result.displayLimit,
    matched_count: result.presentInBoth.length,
    only_in_shopify_count: result.onlyInShopify.length,
    only_in_tracezilla_count: result.onlyInTracezilla.length,
    present_in_both: result.presentInBoth,
    only_in_shopify: result.onlyInShopify,
    only_in_tracezilla: result.onlyInTracezilla,
  }, null, 2) : renderTable(result).trimEnd());
} catch (error) {
  const message = error instanceof Error ? error.message : "Unexpected error.";
  console.error(`Comparison failed: ${message}`);
  process.exitCode = 1;
}
