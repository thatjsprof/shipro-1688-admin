import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IProductIngest } from "@/interfaces/collection.interface";

export interface ITopProduct {
  id: string | number;
  image: string;
  description: string;
  url: string | null;
  moq: number | null;
  amountYen: number | null;
  amountNaira: number | null;
  company: string | null;
  stock?: number | null;
  soldOut?: boolean;
  rating?: number | null;
  totalSold?: number | null;
  totalSoldDuration: Record<string, number> | null;
  location?: string | null;
  internalProduct?: boolean;
  category?: string | null;
  source?: "shipro" | "1688";
}

export const topProductApi = createApi({
  reducerPath: "rtk:topProduct",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TopProducts"],
  endpoints: (builder) => ({
    getTopProducts: builder.query<
      ApiResponse<PaginatedResult<ITopProduct[]> & { ingest?: IProductIngest | null }>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: `/admin/top-products`,
        method: "GET",
        params: {
          page: params?.page ?? 0,
          limit: params?.limit ?? 24,
        },
      }),
      providesTags: ["TopProducts"],
    }),
    addTopProducts: builder.mutation<
      ApiResponse<IProductIngest>,
      { links: string }
    >({
      query: (body) => ({
        url: `/admin/top-products`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["TopProducts"],
    }),
    removeTopProduct: builder.mutation<
      ApiResponse<{ productId: string; productCount: number }>,
      string
    >({
      query: (productId) => ({
        url: `/admin/top-products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TopProducts"],
    }),
  }),
});

export const {
  useGetTopProductsQuery,
  useAddTopProductsMutation,
  useRemoveTopProductMutation,
} = topProductApi;
