import { Control, FieldErrors } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ProductFormValues = {
  name: string;
  price: string;
  description?: string;
  sku?: string;
  company?: string;
};

interface ProductGeneralTabProps {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}

export const ProductGeneralTab = ({
  control,
  errors,
}: ProductGeneralTabProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Product name"
                error={!!errors.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Price" error={!!errors.price} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Short description"
                error={!!errors.description}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
