import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/rtk";
import { ISetting } from "@/interfaces/app.interface";

const baseUrl = "/setting";

export const settingApi = createApi({
  reducerPath: "rtk:setting",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetSettings"],
  endpoints: (builder) => {
    return {
      getSettings: builder.query<ApiResponse<ISetting>, void>({
        query: (body) => {
          return {
            url: `${baseUrl}`,
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
              url: `${baseUrl}`,
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
} = settingApi;
