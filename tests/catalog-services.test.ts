import { describe, expect, it } from "vitest";
import { ShopifyCatalogService } from "../src/shopify/shopify-catalog-service.js";
import { ShopifyVariantMapper } from "../src/shopify/shopify-variant-mapper.js";
import { TracezillaCatalogService } from "../src/tracezilla/tracezilla-catalog-service.js";
import { TracezillaSkuMapper } from "../src/tracezilla/tracezilla-sku-mapper.js";

describe("catalog services", () => {
  it("paginates Shopify and skips variants without SKU codes", async () => {
    const pages = [
      { data: { productVariants: { nodes: [{ id: "1", sku: "BANANA-001" }, { id: "2", sku: "" }], pageInfo: { hasNextPage: true, endCursor: "next" } } } },
      { data: { productVariants: { nodes: [{ id: "3", sku: "BANANA-002" }], pageInfo: { hasNextPage: false, endCursor: null } } } },
    ];
    const client = { graphql: async () => pages.shift() ?? {} };

    const items = await new ShopifyCatalogService(client, new ShopifyVariantMapper()).read();

    expect(items.map(({ sku }) => sku)).toEqual(["BANANA-001", "BANANA-002"]);
    expect(pages).toHaveLength(0);
  });

  it("follows tracezilla next-page links", async () => {
    const pages = [
      { data: [{ id: 1, sku_code: "BANANA-001" }], links: { next_page: "https://app.tracezilla.com/api/v1/team/skus?page=2" } },
      { data: [{ id: 2, sku_code: "BANANA-002" }], links: { next_page: null } },
    ];
    const queries: Array<Record<string, string | number>> = [];
    const client = { get: async (_path: string, query: Record<string, string | number>) => { queries.push(query); return pages.shift(); } };

    const items = await new TracezillaCatalogService(client, new TracezillaSkuMapper()).read();

    expect(items.map(({ sku }) => sku)).toEqual(["BANANA-001", "BANANA-002"]);
    expect(queries[1]).toMatchObject({ page: "2" });
  });
});
