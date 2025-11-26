import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IOrderItem, OrderStatus } from "@/interfaces/order.interface";

const baseUrl = "/admin/order";

export const orderApi = createApi({
  reducerPath: "rtk:order",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetOrderItems", "GetOrder"],
  endpoints: (builder) => {
    return {
      getOrderItems: builder.query<
        ApiResponse<PaginatedResult<IOrderItem[]>>,
        {
          limit?: number;
          page?: number;
          statuses?: string[];
          search?: string[];
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/items/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetOrderItems"],
      }),
      updateItems: builder.mutation<
        ApiResponse<IOrderItem[]>,
        Partial<{
          items: string[];
          data: {
            status?: OrderStatus;
            timeArrivedInWarehouse?: Date;
            trackingNumber?: string;
            images?: {
              filename: string;
              key: string;
              url: string;
            }[];
            packageWeight?: number;
            sendEmail?: boolean;
          };
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/items`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: ["GetOrderItems"],
      }),
    };
  },
});

export const {
  useGetOrderItemsQuery,
  useLazyGetOrderItemsQuery,
  useUpdateItemsMutation,
} = orderApi;
