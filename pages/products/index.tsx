import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ProductFormValues,
  ProductGeneralTab,
} from "@/components/pages/products/general";
import { ProductDetailsTab } from "@/components/pages/products/details";
import { useQueryTabs } from "@/hooks/use-query-tabs";

enum ITabs {
  General = "general",
  Details = "details",
}

const TAB_VALUES = [ITabs.General, ITabs.General] as const;
const DEFAULT_TAB = ITabs.General;

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  company: z.string().optional(),
});

const Products = () => {
  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues: TAB_VALUES,
    defaultValue: DEFAULT_TAB,
  });

  const form = useForm<ProductFormValues, any, ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    mode: "onTouched",
    defaultValues: {
      name: "",
      price: "",
      description: "",
      sku: "",
      company: "",
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    console.log("Product submit", values);
  };

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-6"
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <ProductGeneralTab control={control} errors={errors} />
            </TabsContent>

            <TabsContent value="details">
              <ProductDetailsTab control={control} errors={errors} />
            </TabsContent>
          </Tabs>

          <Button type="submit" className="h-11 shadow-none">
            Save Product
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Products;
