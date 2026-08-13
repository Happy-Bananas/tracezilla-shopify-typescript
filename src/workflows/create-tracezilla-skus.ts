export interface VariantReader { readVariants(): Promise<Record<string, unknown>[]>; }
export interface SkuGateway { existingSkuCodes(): Promise<string[]>; createSku(payload: Record<string, unknown>): Promise<unknown>; }
export interface CreationItem { source_id: string; sku: string | null; status: string; message: string; }

export class CreateTracezillaSkus {
  constructor(private readonly source: VariantReader, private readonly target: SkuGateway) {}
  async run(dryRun = true, limit = 10) {
    if (!Number.isInteger(limit) || limit < 1) throw new Error("limit must be a positive integer.");
    const variants = await this.source.readVariants();
    const existing = new Set((await this.target.existingSkuCodes()).map((sku) => sku.trim()));
    const seen = new Set<string>(); const items: CreationItem[] = [];
    for (const variant of variants.slice(0, limit)) {
      const sourceId = typeof variant.id === "string" ? variant.id : "unknown";
      const sku = typeof variant.sku === "string" && variant.sku.trim() ? variant.sku.trim() : null;
      if (!sku) { items.push({source_id: sourceId, sku, status:"invalid", message:"Shopify variant does not have an SKU."}); continue; }
      if (existing.has(sku)) { items.push({source_id:sourceId, sku, status:"skipped", message:"SKU already exists in tracezilla."}); continue; }
      if (seen.has(sku)) { items.push({source_id:sourceId, sku, status:"skipped", message:"Another Shopify variant in this run has the same SKU."}); continue; }
      seen.add(sku);
      // Example business mapping. Review these assumptions for every customer.
      const payload = {sku_code:sku, global_name:sku, weight_factor_net:1.0, weight_factor_gross:1.0, unit_of_measure:"pcs", lot_unit:"colli", default_uom_conversion:1.0};
      if (dryRun) items.push({source_id:sourceId, sku, status:"would_create", message:"SKU would be created during execution."});
      else try { await this.target.createSku(payload); existing.add(sku); items.push({source_id:sourceId, sku, status:"created", message:"SKU was created in tracezilla."}); }
      catch { items.push({source_id:sourceId, sku, status:"failed", message:"tracezilla rejected the SKU creation request."}); }
    }
    const count = (status:string) => items.filter((item) => item.status === status).length;
    return {summary:{source_count:variants.length, selected_count:Math.min(limit,variants.length), processed_count:items.length, created_count:count("created"), would_create_count:count("would_create"), skipped_count:count("skipped"), invalid_count:count("invalid"), failed_count:count("failed"), dry_run:dryRun, limit}, items};
  }
}
