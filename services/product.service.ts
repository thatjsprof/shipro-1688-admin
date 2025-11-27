import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IProduct } from "@/interfaces/product.interface";

const baseUrl = "/shipro-product";

export const productApi = createApi({
  reducerPath: "rtk:product",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetProducts", "GetProduct"],
  endpoints: (builder) => {
    return {
      getProducts: builder.query<
        ApiResponse<PaginatedResult<IProduct[]>>,
        {
          limit?: number;
          page?: number;
          search?: string;
        }
      >({
        query: ({ limit, page, search }) => {
          return {
            url: `${baseUrl}?limit=${limit}&page=${page}${
              search ? `&search=${search}` : ""
            }`,
            method: "GET",
          };
        },
        providesTags: ["GetProducts"],
      }),
      getProduct: builder.query<ApiResponse<IProduct>, string>({
        query: (id) => {
          return {
            url: `${baseUrl}/${id}`,
            method: "GET",
          };
        },
        providesTags: ["GetProduct"],
      }),
      createProduct: builder.mutation<ApiResponse<IProduct>, Partial<IProduct>>(
        {
          query: (body) => {
            return {
              url: `${baseUrl}`,
              method: "POST",
              body,
            };
          },
          invalidatesTags: ["GetProducts", "GetProduct"],
        }
      ),
      updateProduct: builder.mutation<
        ApiResponse<IProduct>,
        {
          id: string;
          data: Partial<IProduct>;
        }
      >({
        query: ({ data, id }) => {
          return {
            url: `${baseUrl}/${id}`,
            method: "PATCH",
            body: data,
          };
        },
        invalidatesTags: ["GetProducts", "GetProduct"],
      }),
    };
  },
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useGetProductQuery,
} = productApi;
