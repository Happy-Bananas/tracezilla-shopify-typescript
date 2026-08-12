import { describe, expect, it } from "vitest";
import { ShopifyVariantMapper } from "../src/shopify/shopify-variant-mapper.js";
import { TracezillaSkuMapper } from "../src/tracezilla/tracezilla-sku-mapper.js";

describe("catalog mappers", () => {
  it("normalizes Shopify variants and skips blank SKUs", () => {
    const mapper = new ShopifyVariantMapper();
    expect(mapper.map({ id: "gid://variant/1", sku: " BANANA-001 ", displayName: "Banana" })?.sku).toBe("BANANA-001");
    expect(mapper.map({ id: "gid://variant/2", sku: " " })).toBeNull();
  });

  it("normalizes tracezilla SKUs", () => {
    const item = new TracezillaSkuMapper().map({ id: 42, sku_code: " BANANA-001 ", name: "Banana" });
    expect(item).toMatchObject({ sku: "BANANA-001", sourceId: "42", name: "Banana" });
  });
});
