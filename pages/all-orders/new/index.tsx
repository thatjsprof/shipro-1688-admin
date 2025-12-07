import Details from "@/components/pages/all-orders/details";
import Items from "@/components/pages/all-orders/items";
import Cart from "@/components/pages/users/cart";
import Wallet from "@/components/pages/users/wallet";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/use-query-tabs";
import {
  OrderOrigin,
  OrderStatus,
  OrderType,
} from "@/interfaces/order.interface";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

enum ITabs {
  Details = "details",
  Items = "items",
  Payment = "payment",
}

const TAB_VALUES = [ITabs.Details, ITabs.Items, ITabs.Payment];
const DEFAULT_TAB = ITabs.Details;

const NewOrder = () => {
  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues: TAB_VALUES,
    defaultValue: DEFAULT_TAB,
  });

  const form = useForm<z.infer<typeof createOrderSchema>>({
    resolver: zodResolver(createOrderSchema),
    mode: "onTouched",
    defaultValues: {
      order: {
        type: OrderType.PURCHASE,
        origin: OrderOrigin.SOURCING,
        status: OrderStatus.DRAFT,
      },
      items: [
        {
          name: "",
          status: OrderStatus.DRAFT,
          quantity: "",
          packageWeight: "",
          items: [],
        },
      ],
      payments: [],
    },
    values: {
      order: {
        type: OrderType.PURCHASE,
        origin: OrderOrigin.SOURCING,
        status: OrderStatus.DRAFT,
      },
      items: [
        {
          name: "",
          status: OrderStatus.DRAFT,
          quantity: "",
          packageWeight: "",
          items: [],
        },
      ],
      payments: [],
    },
  });

  const onSubmit = (values: z.infer<any>) => {};

  useEffect(() => {
    document.title = `Orders | Shipro Africa`;
  }, []);

  return (
    <div className="py-8">
      <Link href="/all-orders">
        <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm cursor-pointer w-fit">
          <ArrowLeft className="size-5" />
          Back to Orders
        </div>
      </Link>
      <h1 className="text-2xl font-semibold mb-8">Order Information</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value={ITabs.Details}>Order Details</TabsTrigger>
              <TabsTrigger value={ITabs.Items}>Order Items</TabsTrigger>
              <TabsTrigger value={ITabs.Payment}>Payment</TabsTrigger>
            </TabsList>
            <TabsContent value={ITabs.Details}>
              <Details form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Items}>
              <Items form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Payment}>
              <Cart />
            </TabsContent>
          </Tabs>
          <Button
            type="submit"
            // disabled={isLoading || isLoadingUpdate}
            className="h-14 font-semibold px-6 shadow-none mt-[3rem]"
          >
            {/* {(isLoading || isLoadingUpdate) && (
              <Icons.spinner className="h-3 w-3 animate-spin" />
            )} */}
            Save Order
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewOrder;
