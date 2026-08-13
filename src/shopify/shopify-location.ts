export interface ShopifyLocation {
  graph_ql_id: string;
  legacy_id: string;
  name: string;
  is_active: boolean;
  has_active_inventory: boolean;
  fulfills_online_orders: boolean;
  address: { address1: string | null; address2: string | null; city: string | null; province: string | null; country: string | null; zip: string | null };
}
