import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import {
  IOrder,
  IOrderItem,
  OrderEmails,
  OrderStatus,
} from "@/interfaces/order.interface";

const baseUrl = "/admin/order";

export const orderApi = createApi({
  reducerPath: "rtk:order",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetOrderItems", "GetOrder", "GetOrders"],
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
      getOrders: builder.query<
        ApiResponse<PaginatedResult<IOrder[]>>,
        {
          limit?: number;
          page?: number;
          statuses?: string[];
          origins?: string[];
          types?: string[];
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
            tags?: string[];
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
      sendEmails: builder.mutation<
        ApiResponse<IOrderItem[]>,
        Partial<{
          items: string[];
          data: {
            emailType?: OrderEmails | string;
          };
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/items/email`,
            method: "POST",
            body: data,
          };
        },
      }),
    };
  },
});

export const {
  useGetOrderItemsQuery,
  useLazyGetOrderItemsQuery,
  useUpdateItemsMutation,
  useSendEmailsMutation,
  useGetOrdersQuery,
} = orderApi;
