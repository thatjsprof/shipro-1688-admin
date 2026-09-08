import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import {
  CollectionProductsParams,
  CreateCollectionPayload,
  ICollection,
  ICollectionProductCard,
  IResolveProductResult,
  ListCollectionsParams,
  UpdateCollectionPayload,
} from "@/interfaces/collection.interface";

export const collectionApi = createApi({
  reducerPath: "rtk:collection",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Collections", "Collection", "CollectionProducts"],
  endpoints: (builder) => ({
    getCollections: builder.query<
      ApiResponse<PaginatedResult<ICollection[]>>,
      ListCollectionsParams | void
    >({
      query: (params) => ({
        url: `/admin/collections`,
        method: "GET",
        params: {
          page: params?.page ?? 0,
          limit: params?.limit ?? 20,
          search: params?.search ?? "",
          active: params?.active ?? "all",
        },
      }),
      providesTags: ["Collections"],
    }),
    getCollection: builder.query<ApiResponse<ICollection>, string>({
      query: (id) => ({
        url: `/admin/collections/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Collection", id }],
    }),
    getCollectionProducts: builder.query<
      ApiResponse<
        PaginatedResult<ICollectionProductCard[]> & { collection: ICollection }
      >,
      CollectionProductsParams
    >({
      query: ({ id, page = 0, limit = 24 }) => ({
        url: `/admin/collections/${id}/products`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (_r, _e, { id }) => [{ type: "CollectionProducts", id }],
    }),
    createCollection: builder.mutation<
      ApiResponse<
        ICollection & {
          resolve: {
            added: number;
            skipped: number;
            failed: IResolveProductResult[];
          } | null;
        }
      >,
      CreateCollectionPayload
    >({
      query: (body) => ({
        url: `/admin/collections`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Collections"],
    }),
    updateCollection: builder.mutation<
      ApiResponse<ICollection>,
      { id: string; body: UpdateCollectionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/collections/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Collections",
        { type: "Collection", id },
      ],
    }),
    deleteCollection: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/admin/collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Collections"],
    }),
    resolveCollectionProducts: builder.mutation<
      ApiResponse<{
        results: IResolveProductResult[];
        succeeded: number;
        failed: number;
      }>,
      { links: string }
    >({
      query: (body) => ({
        url: `/admin/collections/resolve-products`,
        method: "POST",
        body,
      }),
    }),
    addCollectionProducts: builder.mutation<
      ApiResponse<{
        added: number;
        skipped: number;
        failed: IResolveProductResult[];
        collection: ICollection;
      }>,
      { id: string; links: string }
    >({
      query: ({ id, links }) => ({
        url: `/admin/collections/${id}/products`,
        method: "POST",
        body: { links },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Collections",
        { type: "Collection", id },
        { type: "CollectionProducts", id },
      ],
    }),
    removeCollectionProduct: builder.mutation<
      ApiResponse<{
        collectionId: string;
        productId: string;
        productCount: number;
      }>,
      { id: string; productId: string }
    >({
      query: ({ id, productId }) => ({
        url: `/admin/collections/${id}/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Collections",
        { type: "Collection", id },
        { type: "CollectionProducts", id },
      ],
    }),
  }),
});

export const {
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useGetCollectionProductsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useResolveCollectionProductsMutation,
  useAddCollectionProductsMutation,
  useRemoveCollectionProductMutation,
} = collectionApi;
