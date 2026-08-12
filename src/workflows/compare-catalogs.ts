import type { CatalogItem, CatalogReader } from "../shared/catalog-item.js";

export interface CatalogComparisonResult {
  status: "match" | "differences";
  displayLimit: number;
  presentInBoth: string[];
  onlyInShopify: string[];
  onlyInTracezilla: string[];
}

export class CompareCatalogs {
  constructor(private readonly shopify: CatalogReader, private readonly tracezilla: CatalogReader) {}

  async run(displayLimit = 10): Promise<CatalogComparisonResult> {
    if (!Number.isInteger(displayLimit) || displayLimit < 1) throw new Error("The display limit must be a positive integer.");
    const [shopifyItems, tracezillaItems] = await Promise.all([this.shopify.read(), this.tracezilla.read()]);
    const shopify = indexBySku(shopifyItems);
    const tracezilla = indexBySku(tracezillaItems);
    const presentInBoth = [...shopify.keys()].filter((sku) => tracezilla.has(sku)).sort();
    const onlyInShopify = [...shopify.keys()].filter((sku) => !tracezilla.has(sku)).sort();
    const onlyInTracezilla = [...tracezilla.keys()].filter((sku) => !shopify.has(sku)).sort();
    return {
      status: onlyInShopify.length === 0 && onlyInTracezilla.length === 0 ? "match" : "differences",
      displayLimit,
      presentInBoth,
      onlyInShopify,
      onlyInTracezilla,
    };
  }
}

function indexBySku(items: CatalogItem[]): Map<string, CatalogItem> {
  return new Map(items.map((item) => [item.sku, item]));
}
