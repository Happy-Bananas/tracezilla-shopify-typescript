import { describe, expect, it } from "vitest";
import { renderTable } from "../src/output/table-renderer.js";

describe("renderTable", () => {
  it("renders categories, counts, and the display limit", () => {
    const output = renderTable({
      status: "differences",
      displayLimit: 10,
      presentInBoth: ["BANANA-001"],
      onlyInShopify: ["BANANA-002"],
      onlyInTracezilla: ["BANANA-003"],
    });
    expect(output).toContain("Missing in tracezilla");
    expect(output).toContain("Missing in Shopify");
    expect(output).toContain("Matched: 1");
    expect(output).toContain("at most 10 rows");
  });
});
