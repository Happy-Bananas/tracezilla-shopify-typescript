import type { ShopifyLocation } from "../shopify/shopify-location.js";
interface LocationReader { read(): Promise<ShopifyLocation[]> }
export interface LocationResult { count: number; locations: ShopifyLocation[] }
export class ListShopifyLocations {
  constructor(private readonly reader: LocationReader) {}
  async run(): Promise<LocationResult> { const locations = await this.reader.read(); return { count: locations.length, locations }; }
}
