import { Control, FieldErrors } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "./general";

interface ProductDetailsTabProps {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}

export const ProductDetailsTab = ({
  control,
  errors,
}: ProductDetailsTabProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <Input {...field} placeholder="SKU" error={!!errors.sku} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="company"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Company name"
                error={!!errors.company}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
