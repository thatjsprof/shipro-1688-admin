import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IProductIngest } from "@/interfaces/collection.interface";

export type HomepageSpotlightSection =
  | "hot_selling"
  | "featured"
  | "top_deals";

export interface IHomepageSpotlightImage {
  url: string;
  key?: string;
  filename?: string;
}

export interface IHomepageSpotlightItem {
  id: string;
  section: HomepageSpotlightSection;
  productId: string;
  source: "shipro" | "1688";
  title: string;
  url: string | null;
  images: IHomepageSpotlightImage[];
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const homepageSpotlightApi = createApi({
  reducerPath: "rtk:homepageSpotlight",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["HomepageSpotlight"],
  endpoints: (builder) => ({
    getHomepageSpotlight: builder.query<
      ApiResponse<{
        data: IHomepageSpotlightItem[];
        ingest?: IProductIngest | null;
      }>,
      HomepageSpotlightSection
    >({
      query: (section) => ({
        url: `/admin/homepage-spotlight`,
        method: "GET",
        params: { section },
      }),
      providesTags: ["HomepageSpotlight"],
    }),
    addHomepageSpotlight: builder.mutation<
      ApiResponse<IProductIngest>,
      { section: HomepageSpotlightSection; links: string }
    >({
      query: (body) => ({
        url: `/admin/homepage-spotlight`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HomepageSpotlight"],
    }),
    updateHomepageSpotlight: builder.mutation<
      ApiResponse<IHomepageSpotlightItem>,
      {
        id: string;
        title?: string;
        url?: string | null;
        images?: IHomepageSpotlightImage[];
        visible?: boolean;
        sortOrder?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/homepage-spotlight/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["HomepageSpotlight"],
    }),
    reorderHomepageSpotlight: builder.mutation<
      ApiResponse<IHomepageSpotlightItem[]>,
      { section: HomepageSpotlightSection; ids: string[] }
    >({
      query: (body) => ({
        url: `/admin/homepage-spotlight/reorder`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HomepageSpotlight"],
    }),
    removeHomepageSpotlight: builder.mutation<
      ApiResponse<{ id: string; section: HomepageSpotlightSection }>,
      string
    >({
      query: (id) => ({
        url: `/admin/homepage-spotlight/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HomepageSpotlight"],
    }),
  }),
});

export const {
  useGetHomepageSpotlightQuery,
  useAddHomepageSpotlightMutation,
  useUpdateHomepageSpotlightMutation,
  useReorderHomepageSpotlightMutation,
  useRemoveHomepageSpotlightMutation,
} = homepageSpotlightApi;
