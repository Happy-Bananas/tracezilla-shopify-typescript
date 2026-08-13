export interface TracezillaInventory { sku:string; traceable_available:number; non_traceable_available:number; default_conversion:number; non_traceable_conversion:number }
export interface ShopifyInventory { inventory_item_id:string; sku:string; tracked:boolean; available:number|null }
export interface InventorySource { readWarehouse(number:number):Promise<TracezillaInventory[]> }
export interface InventoryTarget { readAtLocation(id:string):Promise<Map<string,ShopifyInventory>>; setAvailable(item:ShopifyInventory,quantity:number,location:string):Promise<void> }
export class SynchronizeInventory {
  constructor(private source:InventorySource,private target:InventoryTarget) {}
  async run(location:string,warehouse:number,dryRun=true,limit=10) {
    if(!location||!Number.isInteger(warehouse)||warehouse<1||!Number.isInteger(limit)||limit<1) throw new Error("Location, warehouse, and limit must be valid.");
    const source=(await this.source.readWarehouse(warehouse)).slice(0,limit);
    const target=await this.target.readAtLocation(location); const items:Array<Record<string,unknown>>=[];
    for(const inventory of source) {
      const shopify=target.get(inventory.sku);
      if(!shopify){items.push(item(inventory.sku,"skipped","No Shopify variant has this SKU."));continue;}
      if(!shopify.tracked||shopify.available===null){items.push(item(inventory.sku,"skipped","Shopify does not track this item at the configured location."));continue;}
      try {
        const quantity=inventory.traceable_available*inventory.default_conversion+inventory.non_traceable_available*inventory.non_traceable_conversion;
        if(!Number.isSafeInteger(quantity)||quantity<0) throw new Error("Mapped quantity must be a non-negative whole number.");
        if(quantity===shopify.available) items.push(item(inventory.sku,"unchanged",`Quantity is already ${quantity}.`,quantity,quantity));
        else if(dryRun) items.push(item(inventory.sku,"would_update",`Would change quantity from ${shopify.available} to ${quantity}.`,shopify.available,quantity));
        else { await this.target.setAvailable(shopify,quantity,location); items.push(item(inventory.sku,"updated",`Changed quantity from ${shopify.available} to ${quantity}.`,shopify.available,quantity)); }
      } catch(error) { items.push(item(inventory.sku,"failed",error instanceof Error?error.message:"Inventory update failed.")); }
    }
    const count=(status:string)=>items.filter(x=>x.status===status).length;
    return {summary:{dry_run:dryRun,updated:count("updated"),would_update:count("would_update"),unchanged:count("unchanged"),skipped:count("skipped"),failed:count("failed")},items};
  }
}
const item=(sku:string,status:string,message:string,from:number|null=null,to:number|null=null)=>({sku,status,message,from,to});
