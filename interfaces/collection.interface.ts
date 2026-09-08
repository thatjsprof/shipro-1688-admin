export type CollectionProductSource = "shipro" | "1688";

export interface ICollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  active: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICollectionProductCard {
  id: string;
  image: string;
  description: string;
  url: string | null;
  moq: number | null;
  amountYen: number | null;
  amountNaira: number | null;
  company: string | null;
  stock: number | null;
  soldOut: boolean;
  rating: number | null;
  totalSold: number | null;
  totalSoldDuration: Record<string, number> | null;
  location: string | null;
  internalProduct: boolean;
  category: string | null;
  source: CollectionProductSource;
  sortOrder: number;
}

export interface IResolvedCollectionProduct {
  productId: string;
  image: string;
  description: string;
  url: string | null;
  moq: number | null;
  amountYen: number | null;
  amountNaira: number | null;
  company: string | null;
  stock: number | null;
  soldOut: boolean;
  rating: number | null;
  totalSold: number | null;
  totalSoldDuration: Record<string, number> | null;
  location: string | null;
  internalProduct: boolean;
  category: string | null;
  source: CollectionProductSource;
}

export interface IResolveProductResult {
  input: string;
  success: boolean;
  error?: string;
  product?: IResolvedCollectionProduct;
}

export interface CreateCollectionPayload {
  title: string;
  description?: string;
  coverImage?: string | null;
  active?: boolean;
  productLinks?: string;
}

export interface UpdateCollectionPayload {
  title?: string;
  description?: string;
  coverImage?: string | null;
  active?: boolean;
}

export interface ListCollectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: "true" | "false" | "all";
}

export interface CollectionProductsParams {
  id: string;
  page?: number;
  limit?: number;
}
