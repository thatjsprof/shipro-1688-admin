import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { IProductIngest } from "@/interfaces/collection.interface";

export type HomepageSpotlightSection = "featured" | "top_deals";

export interface IHomepageSpotlightImage {
  url: string;
  key?: string;
  filename?: string;
}

export interface IHomepageSpotlightItem {
  id: string;
  productId: string;
  section: HomepageSpotlightSection;
  source: "shipro" | "1688";
  visible: boolean;
  sortOrder: number;
  image: string;
  gallery: IHomepageSpotlightImage[];
  images: IHomepageSpotlightImage[];
  description: string;
  url: string | null;
  moq: number | null;
  amountYen: number | null;
  amountNaira: number | null;
  company: string | null;
  stock?: number | null;
  soldOut?: boolean;
  rating?: number | null;
  totalSold?: number | null;
  totalSoldDuration: Record<string, number> | null;
  location?: string | null;
  internalProduct?: boolean;
  category?: string | null;
}

export const SPOTLIGHT_DISPLAY_LIMITS: Record<
  HomepageSpotlightSection,
  number | null
> = {
  featured: 6,
  top_deals: 12,
};

export const SPOTLIGHT_IMAGE_LIMITS: Record<HomepageSpotlightSection, number> = {
  featured: 1,
  top_deals: 1,
};

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
        description?: string;
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
    bulkSetHomepageSpotlightVisibility: builder.mutation<
      ApiResponse<{ updated: number; visible: boolean }>,
      { ids: string[]; visible: boolean }
    >({
      query: (body) => ({
        url: `/admin/homepage-spotlight/bulk-visibility`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HomepageSpotlight"],
    }),
    bulkRemoveHomepageSpotlight: builder.mutation<
      ApiResponse<{ removed: number }>,
      { ids: string[] }
    >({
      query: (body) => ({
        url: `/admin/homepage-spotlight/bulk-delete`,
        method: "POST",
        body,
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
  useBulkSetHomepageSpotlightVisibilityMutation,
  useBulkRemoveHomepageSpotlightMutation,
} = homepageSpotlightApi;
