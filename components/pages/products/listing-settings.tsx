import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ProductFormInput } from "@/schemas/product";
import { UseFormReturn } from "react-hook-form";

type ListingSettingsProps = {
  form: UseFormReturn<ProductFormInput>;
};

export default function ListingSettings({ form }: ListingSettingsProps) {
  const isMoment = form.watch("isMoment") ?? true;
  const archived = form.watch("archived") ?? false;
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
                disabled={archived}
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
                checked={Boolean(field.value) && isMoment && !archived}
                disabled={!isMoment || archived}
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
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Out of stock
            </FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="archived"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked) {
                    form.setValue("isMoment", false);
                    form.setValue("pinTrending", false);
                  }
                }}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Archive product
            </FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="showReviews"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={Boolean(field.value)}
                disabled={archived}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Show Reviews
            </FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="showPackaging"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={Boolean(field.value)}
                disabled={archived}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0 font-medium cursor-pointer">
              Show Packaging Information
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}
