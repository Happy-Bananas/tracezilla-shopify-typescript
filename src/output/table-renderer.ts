import type { CatalogComparisonResult } from "../workflows/compare-catalogs.js";

export function renderTable(result: CatalogComparisonResult): string {
  const rows: string[][] = [
    ...result.presentInBoth.slice(0, result.displayLimit).map((sku) => [sku, "Yes", "Yes", "Match"]),
    ...result.onlyInShopify.slice(0, result.displayLimit).map((sku) => [sku, "Yes", "No", "Missing in tracezilla"]),
    ...result.onlyInTracezilla.slice(0, result.displayLimit).map((sku) => [sku, "No", "Yes", "Missing in Shopify"]),
  ].sort((left, right) => (left[0] ?? "").localeCompare(right[0] ?? ""));
  const line = (values: string[]) => `${(values[0] ?? "").padEnd(24)} ${(values[1] ?? "").padEnd(10)} ${(values[2] ?? "").padEnd(12)} ${values[3] ?? ""}`;
  return [
    line(["SKU", "Shopify", "tracezilla", "Result"]),
    "-".repeat(72),
    ...rows.map(line),
    "",
    `Matched: ${result.presentInBoth.length}; missing in tracezilla: ${result.onlyInShopify.length}; missing in Shopify: ${result.onlyInTracezilla.length}`,
    `Showing at most ${result.displayLimit} rows from each result category.`,
  ].join("\n") + "\n";
}
