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
          archived?: boolean;
        }
      >({
        query: ({ limit, page, search, archived }) => {
          const params = new URLSearchParams({
            limit: String(limit),
            page: String(page),
          });
          if (search) params.set("search", search);
          if (archived !== undefined) {
            params.set("archived", String(archived));
          }
          return {
            url: `${baseUrl}?${params.toString()}`,
            method: "GET",
          };
        },
        providesTags: () => [{ type: "GetProducts", id: "LIST" }],
      }),
      getProduct: builder.query<ApiResponse<IProduct>, string>({
        query: (id) => {
          return {
            url: `${baseUrl}/${id}?parse=false`,
            method: "GET",
          };
        },
        providesTags: (_result, _error, id) => [{ type: "GetProduct", id }],
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
          invalidatesTags: () => [{ type: "GetProducts", id: "LIST" }],
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
        invalidatesTags: (_result, _error, { id }) => [
          { type: "GetProducts", id: "LIST" },
          { type: "GetProduct", id },
        ],
      }),
      deleteProduct: builder.mutation<ApiResponse<{ id: string }>, string>({
        query: (id) => ({
          url: `${baseUrl}/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: "GetProducts", id: "LIST" },
          { type: "GetProduct", id },
        ],
      }),
    };
  },
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
} = productApi;
