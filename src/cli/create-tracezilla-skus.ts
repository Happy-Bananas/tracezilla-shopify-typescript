import "dotenv/config";
import {configurationFromEnvironment} from "../configuration.js";
import {ShopifyCatalogService} from "../shopify/shopify-catalog-service.js"; import {ShopifyClient} from "../shopify/shopify-client.js"; import {ShopifyVariantMapper} from "../shopify/shopify-variant-mapper.js";
import {TracezillaCatalogService} from "../tracezilla/tracezilla-catalog-service.js"; import {TracezillaClient} from "../tracezilla/tracezilla-client.js"; import {TracezillaSkuMapper} from "../tracezilla/tracezilla-sku-mapper.js";
import {CreateTracezillaSkus} from "../workflows/create-tracezilla-skus.js";
try {
  const execute=process.argv.includes("--execute"), confirm=process.argv.includes("--confirm");
  if(execute&&!confirm) throw new Error("Execution requires both --execute and --confirm.");
  const arg=process.argv.find(x=>x.startsWith("--limit=")); const limit=arg?Number(arg.slice(8)):10;
  const config=configurationFromEnvironment(process.env);
  const result=await new CreateTracezillaSkus(new ShopifyCatalogService(new ShopifyClient(config),new ShopifyVariantMapper()),new TracezillaCatalogService(new TracezillaClient(config),new TracezillaSkuMapper())).run(!execute,limit);
  console.log(JSON.stringify(result,null,2)); if(result.summary.failed_count) process.exitCode=1;
} catch(error){console.error(`SKU creation failed: ${error instanceof Error?error.message:"Unexpected error."}`);process.exitCode=1;}
