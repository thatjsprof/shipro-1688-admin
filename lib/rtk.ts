import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";

const baseUrl = process.env.SERVER_URL!;

export const createBaseQuery = () =>
  fetchBaseQuery({
    baseUrl,
    credentials: "include",
  });

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Partial<Record<string, never>>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await createBaseQuery()(args, api, extraOptions);
  return result;
};
