import { PurchaseStatus, RMBPurchase } from "@/interfaces/rmb.interface";
import { baseQueryWithReauth } from "@/lib/rtk";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseUrl = "/admin/rmb";

export const rmbApi = createApi({
  reducerPath: "rtk:rmb",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetOrders"],
  endpoints: (builder) => {
    return {
      getOrders: builder.query<
        ApiResponse<PaginatedResult<RMBPurchase[]>>,
        {
          limit?: number;
          page?: number;
          statuses?: string[];
          search?: string;
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetOrders"],
      }),
      updateOrder: builder.mutation<
        ApiResponse<RMBPurchase>,
        Partial<{
          id: string;
          data: {
            status?: PurchaseStatus;
          };
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/${data.id}`,
            method: "PUT",
            body: data.data,
          };
        },
        invalidatesTags: ["GetOrders"],
      }),
    };
  },
});

export const { useGetOrdersQuery, useUpdateOrderMutation } = rmbApi;
