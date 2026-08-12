import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogReader } from "../src/shared/catalog-item.js";
import { CompareCatalogs } from "../src/workflows/compare-catalogs.js";

class FakeReader implements CatalogReader {
  constructor(private readonly skus: string[]) {}
  async read(): Promise<CatalogItem[]> {
    return this.skus.map((sku) => ({ sku, sourceId: sku }));
  }
}

describe("CompareCatalogs", () => {
  it("compares complete normalized catalogs", async () => {
    const result = await new CompareCatalogs(
      new FakeReader(["BANANA-002", "BANANA-001"]),
      new FakeReader(["BANANA-001", "BANANA-003"]),
    ).run(10);
    expect(result.presentInBoth).toEqual(["BANANA-001"]);
    expect(result.onlyInShopify).toEqual(["BANANA-002"]);
    expect(result.onlyInTracezilla).toEqual(["BANANA-003"]);
    expect(result.status).toBe("differences");
  });
});
