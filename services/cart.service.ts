import { ICart } from "@/interfaces/cart.interface";
import { baseQueryWithReauth } from "@/lib/rtk";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseUrl = "/admin/cart";

export const cartApi = createApi({
  reducerPath: "rtk:cart",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetCart"],
  endpoints: (builder) => {
    return {
      getCart: builder.query<ApiResponse<ICart>, string>({
        query: (userId) => {
          return {
            url: `${baseUrl}?userId=${userId}`,
            method: "GET",
          };
        },
        providesTags: ["GetCart"],
      }),
    };
  },
});

export const { useGetCartQuery } = cartApi;
