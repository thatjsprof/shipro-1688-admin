import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isRouteMatch = (currentPath: string, pattern: string): boolean => {
  const path = currentPath.replace(/\/$/, "");
  const routePattern = pattern.replace(/\/$/, "");

  if (path === routePattern) return true;
  if (path.startsWith(routePattern + "/")) return true;

  return false;
};

export const formatNum = (value?: number | string): string => {
  if (!value) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  const numToReturn = (val: string) =>
    val.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (Number.isInteger(num)) {
    return numToReturn(num.toString());
  }
  return numToReturn(num.toFixed(2));
};

export const upperCaseFirst = (str: string) => {
  if (!str) return "";
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};
