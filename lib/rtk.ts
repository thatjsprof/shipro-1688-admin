import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { clearAdminSession } from "@/lib/clear-admin-session";
import type { AppDispatch } from "@/store/store";

const baseUrl = process.env.SERVER_URL!;

export const createBaseQuery = () =>
  fetchBaseQuery({
    baseUrl,
    credentials: "include",
  });

function getRequestUrl(args: string | FetchArgs) {
  return typeof args === "string" ? args : args.url;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Partial<Record<string, never>>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await createBaseQuery()(args, api, extraOptions);
  const url = getRequestUrl(args);

  if (
    (result.error?.status === 401 || result.error?.status === 403) &&
    !url.includes("/sign-in/") &&
    !url.includes("/sign-up/")
  ) {
    await clearAdminSession(api.dispatch as AppDispatch);
  }

  return result;
};
