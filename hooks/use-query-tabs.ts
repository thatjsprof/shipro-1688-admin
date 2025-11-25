import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

type UseQueryTabsOptions<T extends readonly string[]> = {
  tabValues: T;
  defaultValue: T[number];
  queryKey?: string;
};

const normalizeQueryValue = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export const useQueryTabs = <T extends readonly string[]>({
  tabValues,
  defaultValue,
  queryKey = "tab",
}: UseQueryTabsOptions<T>) => {
  const router = useRouter();
  const rawValue = normalizeQueryValue(router.query[queryKey]);

  const isTabValue = useCallback(
    (value: string | undefined): value is T[number] => {
      return !!value && tabValues.includes(value as T[number]);
    },
    [tabValues]
  );

  const activeTab = useMemo<T[number]>(() => {
    if (rawValue && isTabValue(rawValue)) {
      return rawValue;
    }
    return defaultValue;
  }, [rawValue, defaultValue, isTabValue]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!isTabValue(rawValue)) {
      const query = { ...router.query, [queryKey]: defaultValue };
      router.replace({ query }, undefined, { shallow: true });
    }
  }, [router, router.isReady, rawValue, defaultValue, isTabValue, queryKey]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (!tabValues.includes(value as T[number])) {
        return;
      }

      const query = { ...router.query, [queryKey]: value };
      router.push({ query }, undefined, { shallow: true });
    },
    [router, tabValues, queryKey]
  );

  return {
    activeTab,
    handleTabChange,
  };
};
