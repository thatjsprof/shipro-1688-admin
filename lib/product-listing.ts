import { ProductFormInput } from "@/schemas/product";
import { UseFormReturn } from "react-hook-form";

function parseStockValue(value?: string | number | null): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = parseInt(String(value).replace(/,/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

export function clearOutOfStockIfStockUpdated(
  form: UseFormReturn<ProductFormInput>,
  stockValue?: string | number | null
) {
  if (!(form.getValues("outOfStock") ?? false)) return;
  if (parseStockValue(stockValue) > 0) {
    form.setValue("outOfStock", false, { shouldDirty: true });
  }
}
