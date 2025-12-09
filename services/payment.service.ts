import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import {
  IPayment,
  PaymentCodes,
  PaymentModules,
  PaymentStatus,
} from "@/interfaces/payment.interface";

const baseUrl = "/admin/payment";

export const paymentApi = createApi({
  reducerPath: "rtk:payment",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetPayments", "GetOrders"],
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
            url: `${baseUrl}/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetPayments"],
      }),
      createPayment: builder.mutation<
        ApiResponse<IPayment>,
        Partial<{
          userId: string;
          orderId: string;
          baseAmount: number;
          amount: number;
          module: PaymentModules;
          status: PaymentStatus;
          description: string;
          code: PaymentCodes;
          redirectLink: string;
          sendEmail: boolean;
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
        invalidatesTags: ["GetPayments", "GetOrders"],
      }),
      updatePayment: builder.mutation<
        ApiResponse<IPayment>,
        Partial<{
          id: string;
          data: {
            amount: number;
            baseAmount: number;
            module: PaymentModules;
            status: PaymentStatus;
            description: string;
            code: PaymentCodes;
            redirectLink: string;
            sendEmail: boolean;
            paymentBreakdown: Record<string, string>[];
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
        invalidatesTags: ["GetPayments", "GetOrders"],
      }),
    };
  },
});

export const {
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useGetPaymentsQuery,
} = paymentApi;
