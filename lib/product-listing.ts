import { ProductFormInput } from "@/schemas/product";
import { UseFormReturn } from "react-hook-form";

export function applyOutOfStockToForm(form: UseFormReturn<ProductFormInput>) {
  form.setValue("outOfStock", true, { shouldDirty: true });
  form.setValue("stock", "0", { shouldDirty: true });

  const skus = form.getValues("skus") ?? {};
  const zeroedSkus = Object.fromEntries(
    Object.entries(skus).map(([key, sku]) => [
      key,
      { ...sku, stock: "0" },
    ])
  );
  form.setValue("skus", zeroedSkus, { shouldDirty: true });
}

export function clearOutOfStockOnForm(form: UseFormReturn<ProductFormInput>) {
  form.setValue("outOfStock", false, { shouldDirty: true });
}
