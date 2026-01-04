import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { ISetting } from "@/interfaces/app.interface";

const baseUrl = "/";

export const settingApi = createApi({
  reducerPath: "rtk:setting",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetSettings", "GetStatistics"],
  endpoints: (builder) => {
    return {
      getDashboard: builder.query<
        ApiResponse<{
          thisMonth: number;
          allTimeOrders: number;
          pendingOrders: number;
          allTimeTotalPayments: number;
        }>,
        void
      >({
        query: (body) => {
          return {
            url: `/statistics`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetStatistics"],
      }),
      getSettings: builder.query<ApiResponse<ISetting>, void>({
        query: (body) => {
          return {
            url: `/setting`,
            method: "GET",
            body,
          };
        },
        providesTags: ["GetSettings"],
      }),
      updateSetting: builder.mutation<ApiResponse<ISetting>, Partial<ISetting>>(
        {
          query: (data) => {
            return {
              url: `/setting`,
              method: "PATCH",
              body: data,
            };
          },
        }
      ),
    };
  },
});

export const {
  useGetSettingsQuery,
  useLazyGetSettingsQuery,
  useUpdateSettingMutation,
  useGetDashboardQuery,
} = settingApi;
