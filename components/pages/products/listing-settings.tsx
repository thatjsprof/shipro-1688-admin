import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  applyOutOfStockToForm,
  clearOutOfStockOnForm,
} from "@/lib/product-listing";
import { ProductFormInput } from "@/schemas/product";
import { UseFormReturn } from "react-hook-form";

type ListingSettingsProps = {
  form: UseFormReturn<ProductFormInput>;
};

export default function ListingSettings({ form }: ListingSettingsProps) {
  const isMoment = form.watch("isMoment") ?? true;
  const outOfStock = form.watch("outOfStock") ?? false;

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-4">
      <p className="text-sm font-semibold text-gray-900">Listing</p>
      <FormField
        control={form.control}
        name="isMoment"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={field.value ?? true}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    form.setValue("pinTrending", false);
                  }
                }}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Show in Moments
            </FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pinTrending"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={Boolean(field.value) && isMoment}
                disabled={!isMoment}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Pin on trending (home page)
            </FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="outOfStock"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    applyOutOfStockToForm(form);
                  } else {
                    clearOutOfStockOnForm(form);
                    field.onChange(false);
                  }
                }}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Out of stock
            </FormLabel>
          </FormItem>
        )}
      />
      {outOfStock && (
        <p className="text-xs text-zinc-500">
          Sets product stock to 0, marks as sold out, and zeros all variant
          stock.
        </p>
      )}
    </div>
  );
}
