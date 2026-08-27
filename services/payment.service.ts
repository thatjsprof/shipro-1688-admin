import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import {
  IPayment,
  PaymentCodes,
  PaymentModules,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { settingApi } from "@/services/management.service";

const baseUrl = "/admin/payment";

const paymentMutationTags = [
  "GetPayments",
  "GetAllPayments",
  "GetPaymentSums",
  "GetPaymentStats",
  "GetOrders",
  "GetOrderItems",
] as const;

const invalidateDashboardStats = async (
  _arg: unknown,
  {
    dispatch,
    queryFulfilled,
  }: {
    dispatch: (action: unknown) => void;
    queryFulfilled: Promise<unknown>;
  }
) => {
  try {
    await queryFulfilled;
    dispatch(settingApi.util.invalidateTags(["GetStatistics"]));
  } catch {
    // Keep cached dashboard stats if the mutation fails.
  }
};

export const paymentApi = createApi({
  reducerPath: "rtk:payment",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "GetPayments",
    "GetOrders",
    "GetOrderItems",
    "GetAllPayments",
    "GetPaymentSums",
    "GetPaymentStats",
  ],
  endpoints: (builder) => {
    return {
      getPayments: builder.query<
        ApiResponse<PaginatedResult<IPayment[]>>,
        {
          limit?: number;
          page?: number;
          statuses?: string[];
          noLimit?: boolean;
          orderId: string;
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/order/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetPayments"],
      }),
      getPaymentSums: builder.query<
        ApiResponse<{
          pending: number;
          successful: number;
        }>,
        void
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/sums`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetPaymentSums"],
      }),
      getPaymentStats: builder.query<
        ApiResponse<
          {
            month: string;
            currentAmount: number;
            previousAmount: number;
            monthYear: string;
            currentYear: number;
            previousYear: number;
          }[]
        >,
        void
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/statistics`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetPaymentStats"],
      }),
      getAllPayments: builder.query<
        ApiResponse<PaginatedResult<IPayment[]>>,
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
        providesTags: ["GetAllPayments"],
      }),
      createPayment: builder.mutation<
        ApiResponse<IPayment>,
        Partial<{
          userId: string;
          orderId: string;
          orderItemId: string;
          baseAmount: number;
          amount: number;
          module: PaymentModules;
          status: PaymentStatus;
          description: string;
          code: PaymentCodes;
          provider: PaymentProviders;
          redirectLink: string;
          sendEmail: boolean;
          datePaid: Date;
          paymentBreakdown: Record<string, string>[];
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: [...paymentMutationTags],
        onQueryStarted: invalidateDashboardStats,
      }),
      updatePayment: builder.mutation<
        ApiResponse<IPayment>,
        Partial<{
          id: string;
          data: Partial<IPayment>
        }>
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/${data.id}`,
            method: "PUT",
            body: data.data,
          };
        },
        invalidatesTags: [...paymentMutationTags],
        onQueryStarted: invalidateDashboardStats,
      }),
      deletePayment: builder.mutation<ApiResponse<void>, string>({
        query: (id) => ({
          url: `${baseUrl}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: [...paymentMutationTags],
        onQueryStarted: invalidateDashboardStats,
      }),
    };
  },
});

export const {
  useGetAllPaymentsQuery,
  useGetPaymentSumsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentsQuery,
  useGetPaymentStatsQuery,
} = paymentApi;
