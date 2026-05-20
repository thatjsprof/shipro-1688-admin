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
          includeArchived?: boolean;
        }
      >({
        query: ({ limit, page, search, includeArchived }) => {
          const params = new URLSearchParams({
            limit: String(limit),
            page: String(page),
          });
          if (search) params.set("search", search);
          if (includeArchived) params.set("includeArchived", "true");
          return {
            url: `${baseUrl}?${params.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["GetProducts"],
      }),
      getProduct: builder.query<ApiResponse<IProduct>, string>({
        query: (id) => {
          return {
            url: `${baseUrl}/${id}?parse=false`,
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
          invalidatesTags: (result) => {
            if (!result) return [];
            return ["GetProducts", "GetProduct"];
          },
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
        invalidatesTags: (result) => {
          if (!result) return [];
          return ["GetProducts", "GetProduct"];
        },
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
