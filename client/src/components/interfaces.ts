export interface Shop {
  id: number;
  title: string;
  sellerId: number;
}

export interface CatalogCardItem {
  id: number;
  productId: number;
  title: string;
  minSellPrice: number;
  thumbnailUrl: string;
  shop: Shop;
  ordersAmount: number | null;
}

export interface MakeSearchResult {
  items: CatalogCardItem[];
  total: number;
}

export interface SearchResponse {
  search: MakeSearchResult;
}
