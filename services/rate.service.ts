import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IRate } from "@/interfaces/app.interface";

const baseUrl = "/rate";

export const rateApi = createApi({
  reducerPath: "rtk:rate",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetRates"],
  endpoints: (builder) => {
    return {
      getRates: builder.query<ApiResponse<IRate[]>, void>({
        query: (body) => {
          return {
            url: `${baseUrl}`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetRates"],
      }),
      updateRate: builder.mutation<ApiResponse<IRate>, Partial<IRate>>({
        query: ({ id, ...rest }) => {
          return {
            url: `${baseUrl}/${id}`,
            method: "PATCH",
            body: rest,
          };
        },
        invalidatesTags: ["GetRates"],
      }),
      createRate: builder.mutation<
        ApiResponse<IRate>,
        {
          baseCurrency: string;
          convertedCurrency: string;
          baseToConverted: number;
          convertedToBase?: number;
          description?: string;
        }
      >({
        query: (body) => {
          return {
            url: `${baseUrl}`,
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["GetRates"],
      }),
    };
  },
});

export const {
  useGetRatesQuery,
  useLazyGetRatesQuery,
  useUpdateRateMutation,
  useCreateRateMutation,
} = rateApi;
