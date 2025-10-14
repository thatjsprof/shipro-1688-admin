import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IOrder } from "@/interfaces/order.interface";

const baseUrl = "/admin/order";

export const orderApi = createApi({
  reducerPath: "rtk:order",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetOrders", "GetOrder"],
  endpoints: (builder) => {
    return {
      getOrders: builder.query<
        ApiResponse<PaginatedResult<IOrder[]>>,
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
    };
  },
});

export const { useGetOrdersQuery } = orderApi;
