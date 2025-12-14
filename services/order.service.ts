import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import {
  AirLocation,
  IOrder,
  IOrderItem,
  IOrderTracking,
  OrderEmails,
  OrderStatus,
  ShippingType,
  TrackingStage,
} from "@/interfaces/order.interface";

const baseUrl = "/admin/order";

export const orderApi = createApi({
  reducerPath: "rtk:order",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetOrderItems", "GetOrder", "GetOrders", "GetOrdersTracking"],
  endpoints: (builder) => {
    return {
      createShipment: builder.mutation<
        ApiResponse<IOrder>,
        {
          itemIds?: string[];
          shippingType?: ShippingType;
          airLocation?: AirLocation;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/shipment`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: (r) => {
          if (!r) return [];
          return ["GetOrders", "GetOrderItems"];
        },
      }),
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
      getTrackingUpdates: builder.query<
        ApiResponse<PaginatedResult<IOrderTracking[]>>,
        {
          limit?: number;
          page?: number;
          noLimit?: boolean;
          orderId: string;
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/tracking/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetOrdersTracking"],
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
      addTrackingUpdate: builder.mutation<
        ApiResponse<IOrderTracking[]>,
        Partial<{
          orderId: string;
          status?: OrderStatus;
          title: string;
          description: string;
          stage: TrackingStage;
          updateOrder?: boolean;
          sendEmail?: boolean;
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/tracking`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: ["GetOrdersTracking"],
      }),
      updateTracking: builder.mutation<
        ApiResponse<IOrderTracking[]>,
        Partial<{
          id: string;
          data: {
            orderId: string;
            status?: OrderStatus;
            title?: string;
            description?: string;
            stage: TrackingStage;
            updateOrder?: boolean;
            sendEmail?: boolean;
          };
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/tracking/${data.id}`,
            method: "PATCH",
            body: data.data,
          };
        },
        invalidatesTags: ["GetOrdersTracking"],
      }),
      createOrder: builder.mutation<
        ApiResponse<IOrder[]>,
        Partial<{
          order: any;
          payment: any;
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: ["GetOrders"],
      }),
      updateOrder: builder.mutation<
        ApiResponse<IOrder[]>,
        Partial<{
          id: string;
          data: {
            status?: OrderStatus;
            trackingNumber?: string;
            packageWeight?: number;
            sendEmail?: boolean;
            deliveredAt?: string | Date;
            addTracking?: boolean;
          };
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/${data.id}`,
            method: "PATCH",
            body: data.data,
          };
        },
        invalidatesTags: ["GetOrders", "GetOrdersTracking"],
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
  useUpdateOrderMutation,
  useGetOrdersQuery,
  useCreateShipmentMutation,
  useCreateOrderMutation,
  useUpdateTrackingMutation,
  useAddTrackingUpdateMutation,
  useGetTrackingUpdatesQuery,
} = orderApi;
