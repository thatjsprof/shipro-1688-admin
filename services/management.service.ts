import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { ISetting } from "@/interfaces/app.interface";
import {
  CreateDiscountPayload,
  IDiscount,
  UpdateDiscountPayload,
} from "@/interfaces/discount.interface";

const baseUrl = "/";

export const settingApi = createApi({
  reducerPath: "rtk:setting",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetSettings", "GetStatistics", "GetDiscounts"],
  endpoints: (builder) => {
    return {
      getDashboard: builder.query<
        ApiResponse<{
          thisMonth: number;
          allTimeOrders: number;
          pendingOrders: number;
          allTimeTotalPayments: number;
        }>,
        void
      >({
        query: (body) => {
          return {
            url: `/statistics`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetStatistics"],
      }),
      getSettings: builder.query<ApiResponse<ISetting>, void>({
        query: (body) => {
          return {
            url: `/setting`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetSettings"],
      }),
      updateSetting: builder.mutation<ApiResponse<ISetting>, Partial<ISetting>>(
        {
          query: (data) => {
            return {
              url: `/setting`,
              method: "PATCH",
              body: data,
            };
          },
          invalidatesTags: ["GetSettings"],
        }
      ),
      updateAccountDialog: builder.mutation<
        ApiResponse<ISetting>,
        {
          enabled: boolean;
          title: string;
          message: string;
          imageUrl: string;
          ctaLabel: string;
          ctaUrl: string;
          durationHours: number;
        }
      >({
        query: (data) => ({
          url: `/setting/account-dialog`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["GetSettings"],
      }),
      getDiscounts: builder.query<ApiResponse<IDiscount[]>, void>({
        query: () => ({
          url: `/discounts`,
          method: "GET",
        }),
        providesTags: ["GetDiscounts"],
      }),
      createDiscount: builder.mutation<
        ApiResponse<IDiscount>,
        CreateDiscountPayload
      >({
        query: (body) => ({
          url: `/discounts`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["GetDiscounts"],
      }),
      updateDiscount: builder.mutation<
        ApiResponse<IDiscount>,
        { id: string; body: UpdateDiscountPayload }
      >({
        query: ({ id, body }) => ({
          url: `/discounts/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["GetDiscounts"],
      }),
      deleteDiscount: builder.mutation<ApiResponse<{ id: string }>, string>({
        query: (id) => ({
          url: `/discounts/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["GetDiscounts"],
      }),
    };
  },
});

export const {
  useGetSettingsQuery,
  useLazyGetSettingsQuery,
  useUpdateSettingMutation,
  useUpdateAccountDialogMutation,
  useGetDashboardQuery,
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = settingApi;
