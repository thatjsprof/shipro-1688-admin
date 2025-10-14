import { IUser } from "@/interfaces/user.interface";
import { baseQueryWithReauth } from "@/lib/rtk";
import { createApi } from "@reduxjs/toolkit/query/react";

const baseUrl = "/auth";

export const userApi = createApi({
  reducerPath: "rtk:user",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GetUser"],
  endpoints: (builder) => {
    return {
      getProfile: builder.query<
        {
          session: any;
          user: IUser;
        },
        void
      >({
        query: () => {
          return {
            url: `${baseUrl}/get-session`,
            method: "GET",
          };
        },
        providesTags: ["GetUser"],
      }),
      getOauth: builder.mutation<
        { url: string; redirect: boolean },
        { provider: string; callbackURL?: string }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/sign-in/social`,
            method: "POST",
            body: data,
          };
        },
      }),
      login: builder.mutation<
        {
          token: string;
          user: IUser;
        },
        {
          email: string;
          password: string;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/sign-in/email`,
            method: "POST",
            body: data,
            headers: {
              "x-admin-login": "true",
            },
          };
        },
      }),
      update: builder.mutation<ApiResponse<string>, Partial<IUser>>({
        query: (data) => {
          return {
            url: `${baseUrl}/update-user`,
            method: "POST",
            body: data,
          };
        },
      }),
      forgotPassword: builder.mutation<
        ApiResponse<string>,
        {
          email: string;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/forget-password`,
            method: "POST",
            body: data,
          };
        },
      }),
      changePassword: builder.mutation<
        {
          token: string;
          user: IUser;
        },
        {
          currentPassword: string;
          newPassword: string;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/change-password`,
            method: "POST",
            body: data,
          };
        },
      }),
      resetPassword: builder.mutation<
        ApiResponse<string>,
        {
          token: string;
          newPassword: string;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/reset-password`,
            method: "POST",
            body: data,
          };
        },
      }),
      signup: builder.mutation<
        {
          token: string;
          user: IUser & {
            emailVerified: boolean;
          };
        },
        {
          name: string;
          email: string;
          password: string;
        }
      >({
        query: (data) => {
          return {
            url: `${baseUrl}/sign-up/email`,
            method: "POST",
            body: data,
          };
        },
      }),
      logout: builder.mutation<ApiResponse<void>, void>({
        query: () => {
          return {
            url: `${baseUrl}/sign-out`,
            method: "POST",
          };
        },
      }),
    };
  },
});

export const {
  useLazyGetProfileQuery,
  useSignupMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGetOauthMutation,
} = userApi;
