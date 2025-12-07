import Details from "@/components/pages/all-orders/details";
import Items from "@/components/pages/all-orders/items";
import Payment from "@/components/pages/all-orders/payment";
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
import { PaymentModules, PaymentStatus } from "@/interfaces/payment.interface";
import { notify } from "@/lib/toast";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { useCreateOrderMutation } from "@/services/order.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

enum ITabs {
  Details = "details",
  Items = "items",
  Payment = "payment",
}

// id: z.string().uuid().optional(),
//   userId: z.string().uuid(),
//   items: z.array(
//     z.object({
//       product: z
//         .object({
//           id: z.string().or(z.number()),
//           description: z.string(),
//           company: z.string(),
//           companyId: z.string(),
//           image: z.string().url().optional(),
//           url: z.string().url().optional(),
//           stock: z.number(),
//         })
//         .passthrough(),
//       name: z.string().optional(),
//       category: z.string().optional(),
//       status: z.nativeEnum(OrderStatus).optional(),
//       quantity: z.number().int().positive().nullable(),
//       packageWeight: z.number().optional(),
//       trackingNumber: z.string().optional(),
//       note: z.string().optional(),
//       orderAmount: z.number().optional(),
//       items: z.array(itemSchema).default([]).optional(),
//       variants: z.record(z.any()).optional(),
//     }),
//   ),
//   orderAmount: z.number(),
//   providerCharges: z.number().optional(),
//   subTotal: z.number(),
//   baseAmount: z.number(),
//   serviceCharge: z.number(),
//   note: z.string().optional(),
//   phoneNumber: z.string().optional(),
//   shippingFeeWithinChina: z.number(),
//   orderNumber: z.string().optional(),
//   totalWeight: z.number().optional(),
//   insurance: z.boolean().optional(),
//   status: z.nativeEnum(OrderStatus).optional(),
//   deliveryAddress: addressSchema,
//   estimatedDelivery: z.string().datetime().optional(),
//   origin: z.nativeEnum(OrderOrigin).optional(),

// userId: z.string().uuid().optional(),
//   orderId: z.string().uuid().optional(),
//   sourcingOrderId: z.string().uuid().optional(),
//   reference: z.string().optional(),
//   amount: z.number().positive(),
//   baseAmount: z.number().positive().optional(),
//   currency: z.string().length(3).default('NGN'),
//   showPending: z.boolean().default(true),
//   provider: z.string().optional(),
//   code: z.nativeEnum(PaymentCodes).optional(),
//   status: z.nativeEnum(PaymentStatus).optional(),
//   module: z.nativeEnum(PaymentModules),
//   description: z.string().optional(),
//   sendEmail: z.boolean().optional(),
//   redirectLink: z.string().optional(),
//   providerFees: z.number().nonnegative().optional(),

const TAB_VALUES = [ITabs.Details, ITabs.Items, ITabs.Payment];
const DEFAULT_TAB = ITabs.Details;
const TAB_FIELD_MAP: Record<ITabs, string[]> = {
  [ITabs.Details]: ["order"],
  [ITabs.Items]: ["items"],
  [ITabs.Payment]: ["payments"],
};

const NewOrder = () => {
  const router = useRouter();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

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
        userId: "",
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
      payments: [
        {
          amount: "",
          status: PaymentStatus.PENDING,
          description: "",
          redirectLink: "",
          code: "",
          sendEmail: false,
        },
      ],
    },
    values: {
      order: {
        type: OrderType.PURCHASE,
        origin: OrderOrigin.SOURCING,
        status: OrderStatus.DRAFT,
        userId: "",
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
      payments: [
        {
          amount: "",
          status: PaymentStatus.PENDING,
          description: "",
          redirectLink: "",
          code: "",
          sendEmail: false,
        },
      ],
    },
  });

  const onSubmit = async (values: z.infer<typeof createOrderSchema>) => {
    try {
      const order = values.order;
      const payments = values.payments;
      const items = values.items;
      const response = await createOrder({
        order: {
          userId: order.userId,
          orderAmount: +(order.orderAmount || 0),
          subTotal: +(order.subTotal || 0),
          baseAmount: +(order.orderAmount || 0),
          serviceCharge: +(order.serviceCharge || 0),
          note: order.note,
          phoneNumber: order.phoneNumber,
          shippingFeeWithinChina: +(order.shippingFeeWithinChina || 0),
          totalWeight: order.totalWeight,
          status: order.status,
          origin: order.origin,
          items: items.map((i) => {
            return {
              name: i.name,
              category: i.category,
              status: i.status,
              quantity: +i.quantity,
              packageWeight: +(i.packageWeight || 0),
              trackingNumber: i.trackingNumber,
              note: i.note,
              orderAmount: +(i.orderAmount || 0),
            };
          }),
        },
        payment: payments.map((p) => {
          return {
            amount: +p.amount || 0,
            baseAmount: +p.amount || 0,
            code: p.code,
            status: p.status,
            module: PaymentModules.ORDER,
            description: p.description,
            sendEmail: p.sendEmail,
            redirectLink: p.redirectLink,
          };
        }),
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
        router.push("/all-orders");
      }
    } catch (err) {
      notify("Order could not be created", "error");
    }
  };

  const getErrorByPath = (path: string) => {
    const segments = path.split(".");
    let current: any = form.formState.errors;
    for (const segment of segments) {
      if (!current) return undefined;
      current = current[segment as keyof typeof current];
    }
    return current;
  };

  const tabHasErrors = (tab: ITabs) =>
    TAB_FIELD_MAP[tab].some((fieldPath) => !!getErrorByPath(fieldPath));

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
              <TabsTrigger value={ITabs.Details}>
                Order Details
                {tabHasErrors(ITabs.Details) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger value={ITabs.Items}>
                Order Items
                {tabHasErrors(ITabs.Items) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger value={ITabs.Payment}>
                Payment
                {tabHasErrors(ITabs.Payment) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={ITabs.Details}>
              <Details form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Items}>
              <Items form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Payment}>
              <Payment form={form} />
            </TabsContent>
          </Tabs>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 font-semibold px-6 shadow-none mt-[3rem]"
          >
            {isLoading && <Icons.spinner className="h-3 w-3 animate-spin" />}
            Save Order
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewOrder;
