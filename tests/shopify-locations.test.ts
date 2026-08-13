import { describe, expect, it } from "vitest";
import { ShopifyLocationMapper } from "../src/shopify/shopify-location-mapper.js";
import { ShopifyLocationService } from "../src/shopify/shopify-location-service.js";
import { ListShopifyLocations } from "../src/workflows/list-shopify-locations.js";
const location = { id: "gid://shopify/Location/1", legacyResourceId: "1", name: "Development Warehouse", isActive: true, hasActiveInventory: true, fulfillsOnlineOrders: true, address: { address1: "Banana Street 1", address2: null, city: "Copenhagen", province: null, country: "Denmark", zip: "1000" } };
describe("Shopify locations", () => {
  it("maps a location", () => { expect(new ShopifyLocationMapper().map(location)).toMatchObject({ graph_ql_id: location.id, name: location.name, is_active: true }); });
  it("paginates and returns a structured result", async () => {
    const pages = [{ data: { locations: { nodes: [location], pageInfo: { hasNextPage: true, endCursor: "next" } } } }, { data: { locations: { nodes: [{ ...location, id: "gid://shopify/Location/2", legacyResourceId: "2", name: "Shop" }], pageInfo: { hasNextPage: false, endCursor: null } } } }];
    const service = new ShopifyLocationService({ graphql: async () => pages.shift() ?? {} }, new ShopifyLocationMapper());
    await expect(new ListShopifyLocations(service).run()).resolves.toMatchObject({ count: 2 });
  });
});
