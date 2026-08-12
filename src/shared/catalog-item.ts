export interface CatalogItem {
  sku: string;
  sourceId: string;
  name?: string;
}

export interface CatalogReader {
  read(): Promise<CatalogItem[]>;
}
