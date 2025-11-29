import { IWallet, IWalletTransation } from "@/interfaces/wallet.interface";
import { baseQueryWithReauth } from "@/lib/rtk";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseUrl = "/admin/wallet";

export const walletApi = createApi({
  reducerPath: "rtk:wallet",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetWalletTransactions", "GetWalletTransactionsSum", "GetWallet"],
  endpoints: (builder) => {
    return {
      getWallet: builder.query<ApiResponse<IWallet>, string>({
        query: (userId) => {
          return {
            url: `${baseUrl}?userId=${userId}`,
            method: "GET",
          };
        },
        providesTags: ["GetWallet"],
      }),
      getWalletTransactionsSum: builder.query<
        ApiResponse<{
          totalCredits: number;
          totalDebits: number;
        }>,
        string
      >({
        query: (userId) => {
          return {
            url: `${baseUrl}/transaction/sum?userId=${userId}`,
            method: "GET",
          };
        },
        providesTags: ["GetWalletTransactionsSum"],
      }),
      getWalletTransactions: builder.query<
        ApiResponse<PaginatedResult<IWalletTransation[]>>,
        {
          limit?: number;
          page?: number;
          statuses?: string[];
          search?: string;
          userId: string;
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/transaction/all`,
            method: "POST",
            body,
          };
        },
        providesTags: ["GetWalletTransactions"],
      }),
      createDebit: builder.mutation<
        ApiResponse<IWallet>,
        Partial<{
          userId: string;
          amount: number;
          description: string;
        }>
      >({
        query: (body) => {
          return {
            url: `${baseUrl}/debit`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result) => {
          if (!result) return [];
          return [
            "GetWalletTransactionsSum",
            "GetWalletTransactions",
            "GetWallet",
          ];
        },
      }),
    };
  },
});

export const {
  useGetWalletQuery,
  useLazyGetWalletQuery,
  useCreateDebitMutation,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionsSumQuery,
} = walletApi;
