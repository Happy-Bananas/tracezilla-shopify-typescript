export const GET_LOCATIONS = `
query GetLocations($first: Int!, $after: String) {
  locations(first: $first, after: $after) {
    nodes {
      id legacyResourceId name isActive hasActiveInventory fulfillsOnlineOrders
      address { address1 address2 city province country zip }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
