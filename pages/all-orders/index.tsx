import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IOrder,
  OrderOrigin,
  OrderStatus,
  OrderType,
} from "@/interfaces/order.interface";
import {
  IPayment,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { orderStatusInfo } from "@/lib/constants";
import RichTextContent from "@/components/ui/rich-text-content";
import ProductVariants from "@/components/shared/product-variants";
import { useGetOrdersQuery } from "@/services/order.service";
import { useAppSelector } from "@/store/hooks";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { format } from "date-fns";
import { formatNum } from "@/lib/utils";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MultiSelect } from "@/components/ui/multi-select";
import FadeScrollArea from "@/components/ui/fade-scrollarea";
import UpdateDialog from "@/components/pages/order/order-payment";
type LucideIconName = keyof typeof LucideIcons;

const paymentProviderLabels: Record<PaymentProviders, string> = {
  [PaymentProviders.PAYSTACK]: "Paystack",
  [PaymentProviders.FLUTTERWAVE]: "Flutterwave",
  [PaymentProviders.KORA]: "Korapay",
  [PaymentProviders.BANK_TRANSFER]: "Bank Transfer",
  [PaymentProviders.WALLET]: "Wallet",
};

const humanize = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const amount = (value?: number | string | null) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const uniquePayments = (order: IOrder) => {
  const payments = [
    ...(order.payments ?? []),
    ...(order.items ?? []).flatMap((item) => item.payments ?? []),
  ];

  return Array.from(
    new Map(payments.map((payment) => [payment.id, payment])).values()
  );
};

const providerLabel = (provider?: PaymentProviders | string | null) =>
  paymentProviderLabels[provider as PaymentProviders] ??
  humanize(provider || "Online Payment");

const paymentMethodLines = (payment: IPayment) => {
  const total = amount(payment.baseAmount || payment.amount);
  const wallet = amount(payment.walletAmount);
  const lines: { label: string; value: number }[] = [];

  if (wallet > 0 && wallet < total) {
    lines.push({ label: "Wallet", value: wallet });
    lines.push({
      label: providerLabel(payment.provider),
      value: Math.max(0, total - wallet),
    });
    return lines;
  }

  if (wallet > 0 && wallet >= total) {
    return [{ label: "Wallet", value: total }];
  }

  return [{ label: providerLabel(payment.provider), value: total }];
};

const aggregateMethodLines = (payments: IPayment[]) => {
  const totals = new Map<string, number>();
  for (const payment of payments) {
    for (const line of paymentMethodLines(payment)) {
      totals.set(line.label, (totals.get(line.label) ?? 0) + line.value);
    }
  }
  return Array.from(totals.entries()).map(([label, value]) => ({
    label,
    value,
  }));
};

const PaymentBreakdownDialog = ({ order }: { order: IOrder }) => {
  const payments = uniquePayments(order);
  const successfulPayments = payments.filter(
    (payment) => payment.status === PaymentStatus.SUCCESSFUL
  );
  const methodLines = aggregateMethodLines(
    successfulPayments.length > 0 ? successfulPayments : payments
  );
  const totalPaid = successfulPayments.reduce(
    (total, payment) => total + amount(payment.baseAmount || payment.amount),
    0
  );
  const orderTotal = amount(order.orderAmount);
  const outstanding = Math.max(0, orderTotal - totalPaid);
  const chargeRows = [
    { label: "Items total", value: order.subTotal },
    {
      label: "Shipping fee within China",
      value: order.shippingFeeWithinChina,
    },
    { label: "Service charge", value: order.serviceCharge },
    ...(amount(order.providerCharges) > 0
      ? [{ label: "Provider charges", value: order.providerCharges }]
      : []),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-1 text-sm font-medium text-primary hover:underline"
        >
          View payment breakdown
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle>Payment breakdown</DialogTitle>
          <CardDescription>{order.orderNumber}</CardDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-6 p-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Order charges
              </h3>
              <div className="overflow-hidden rounded-lg border">
                {chargeRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">₦{formatNum(amount(row.value))}</span>
                  </div>
                ))}
                {order.insurance && (
                  <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-medium">
                      {amount(order.insuranceAmount) > 0
                        ? `₦${formatNum(amount(order.insuranceAmount))}`
                        : "Included"}
                    </span>
                  </div>
                )}
                {order.discountCode && (
                  <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Discount code</span>
                    <span className="font-medium">{order.discountCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-semibold">Order total</span>
                  <span className="font-semibold">₦{formatNum(orderTotal)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Paid via
              </h3>
              <div className="overflow-hidden rounded-lg border">
                {methodLines.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No payment methods yet.
                  </div>
                ) : (
                  methodLines.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-b-0"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">₦{formatNum(row.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Payment summary
              </h3>
              <div className="overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-semibold text-green-700">
                    ₦{formatNum(totalPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Outstanding</span>
                  <span className="font-semibold">₦{formatNum(outstanding)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Payments ({payments.length})
              </h3>
              {payments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No payment records yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment: IPayment) => {
                    const lines = paymentMethodLines(payment);
                    const isSplit = lines.length > 1;
                    return (
                      <div key={payment.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {isSplit
                                ? lines.map((l) => l.label).join(" + ")
                                : lines[0]?.label}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {payment.description ||
                                humanize(payment.code || "Payment")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              ₦
                              {formatNum(
                                amount(payment.baseAmount || payment.amount)
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {humanize(payment.status)}
                            </p>
                          </div>
                        </div>
                        {payment.reference && (
                          <p className="mt-3 break-all text-xs text-muted-foreground">
                            Ref: {payment.reference}
                          </p>
                        )}
                        {isSplit && (
                          <div className="mt-3 rounded-md bg-gray-50 px-3 py-2">
                            {lines.map((line) => (
                              <div
                                key={line.label}
                                className="flex items-center justify-between py-1 text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {line.label}
                                </span>
                                <span className="font-medium">
                                  ₦{formatNum(line.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const AllOrders = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [statuses, setStatuses] = useState<
    { value: OrderStatus; label: string }[]
  >([
    {
      value: OrderStatus.PLACED,
      label: "Placed",
    },
    {
      value: OrderStatus.PENDING_PAYMENT,
      label: "Pending Payment",
    },
  ]);
  const [page, setPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const userId = useAppSelector((state) => state.user.user?.id);
  const { data, isLoading, isFetching } = useGetOrdersQuery(
    {
      search: debouncedValue as string,
      statuses: statuses.map((status) => status.value),
      page: page - 1,
      limit: 20,
      types: [OrderType.PURCHASE],
    },
    {
      skip: !userId,
    }
  );
  const orders = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
    }, 300),
    []
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedChangeHandler(value);
  };

  const handleClearSearch = () => {
    setDebouncedValue("");
    setSearchValue("");
  };

  useEffect(() => {
    document.title = `All Orders | Shipro Africa`;
  }, []);

  return (
    <div className="max-w-4xl mt-7">
      <div className="flex items-center gap-3 justify-between mb-8">
        <MultiSelect<OrderStatus>
          options={Object.entries(OrderStatus).map(([_, value]) => ({
            value: value,
            label: orderStatusInfo[value]?.text ?? "",
          }))}
          selected={statuses}
          onChange={(values) => setStatuses(values)}
          placeholder="Select statuses"
          className="h-11"
          align="start"
        />
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Order(s)"
          className="h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]"
          StartIcon={<Search className="ml-2 text-gray-400 h-4 w-4" />}
          EndIcon={
            searchValue ? (
              <X
                className="text-gray-400 -mr-[.1rem] h-4 w-4 cursor-pointer"
                onClick={handleClearSearch}
              />
            ) : null
          }
        />
        <Link href="/all-orders/new">
          <Button className="h-11 shadow-none font-semibold">Create New</Button>
        </Link>
      </div>
      <div className="flex flex-col gap-7">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => i + 1).map((_, i) => {
            return (
              <Card key={i} className="overflow-hidden shadow-none p-0 gap-0">
                <CardHeader className="bg-white border-b p-5 !pb-3">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-[8rem]" />
                    <Skeleton className="h-5 w-[10rem]" />
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <Skeleton className="w-full h-[5rem]" />
                </CardContent>
              </Card>
            );
          })
        ) : orders.length === 0 ? (
          <div className="w-full flex justify-center mt-10">
            <p className="text-2xl font-semibold">No order found</p>
          </div>
        ) : (
          orders.map((order) => {
            const {
              orderAmount,
              id,
              type,
              estimatedDelivery,
              items = [],
              orderNumber,
              createdAt,
              status,
              trackingUpdates,
              origin,
              payments = [],
            } = order;
            const pendingPayments = payments.filter(
              (payment) => payment.status === PaymentStatus.PENDING
            );
            const pendingItemsPayments = items.map((item) =>
              item.payments.filter((i) => i.status === PaymentStatus.PENDING)
            );
            const totalPendingPayments = [
              ...pendingPayments,
              ...pendingItemsPayments.flat(),
            ];
            const hasPendingPayments =
              type === OrderType.PURCHASE && totalPendingPayments.length > 0;
            const statusInfo = orderStatusInfo[status];
            const IconComponent = LucideIcons[
              statusInfo?.icon as LucideIconName
            ] as LucideIcons.LucideIcon;

            return (
              <Card key={id} className="overflow-hidden shadow-none p-0 gap-0">
                <CardHeader className="bg-white border-b p-5 !pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{orderNumber}</CardTitle>
                      {createdAt && (
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <LucideIcons.Clock className="w-4 h-4" />
                          Ordered on {format(createdAt, "MM/dd/yyy h:mm a")}
                        </CardDescription>
                      )}
                      <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <LucideIcons.User className="w-4 h-4" />
                        Ordered by {order.user?.name}
                      </p>
                      <PaymentBreakdownDialog order={order} />
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shadow-none h-11"
                        onClick={() => {
                          setOrder(order);
                          setOpen(true);
                        }}
                      >
                        <LucideIcons.Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FadeScrollArea className="flex gap-3 relative max-h-[30rem]">
                    <div className="space-y-4 p-5">
                      {items.map((item) => {
                        const statusInfo = orderStatusInfo[item.status];
                        const IconComponent = LucideIcons[
                          statusInfo?.icon as LucideIconName
                        ] as LucideIcons.LucideIcon;
                        const product = item?.product;
                        const items = Array.isArray(item?.items)
                          ? item?.items
                          : [];

                        return (
                          <div key={item.id}>
                            {origin === OrderOrigin.NORMAL ? (
                              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-4">
                                  {product?.image && (
                                    <div className="text-4xl">
                                      <img
                                        src={`${process.env.SERVER_URL}/proxy?url=${product.image}`}
                                        className="h-16 w-16 object-cover object-center rounded-lg"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <RichTextContent
                                      html={
                                        product?.description || item.name || ""
                                      }
                                      className="font-semibold text-gray-900 max-w-md"
                                    />
                                    <ProductVariants
                                      variants={item.variants}
                                      className="mt-1"
                                      itemClassName="text-sm text-gray-600"
                                    />
                                    <div className="flex gap-4 mt-2 text-sm">
                                      <span className="text-gray-600">
                                        Qty: {item?.quantity}
                                      </span>
                                      <span className="text-gray-600"></span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {IconComponent && (
                                    <div
                                      className="rounded-full flex items-center gap-2 px-[10px] py-[6px] text-[.82rem] font-semibold text-nowrap"
                                      style={{
                                        backgroundColor: statusInfo?.bgColor,
                                        color: statusInfo?.color ?? "#fff",
                                      }}
                                    >
                                      <IconComponent className="size-4" />
                                      {statusInfo?.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              (() => {
                                const quantity =
                                  (items ?? [])
                                    .map((i) => i.quantity ?? 0)
                                    .reduce((acc, cur) => (acc += cur), 0) ||
                                  item.quantity;
                                const images = (item.items ?? [])
                                  .map((i) => (i.pictures ?? []).map((p) => p.url))
                                  .flat();
                                const actImages = (item.images ?? []).map((p) => p.url)
                                const image = actImages?.[0] || images?.[0] || item.product?.image;
                                const pictureItems =
                                  items?.filter(
                                    (item) => item.type === "picture"
                                  ) || [];
                                const linkItems =
                                  items?.filter(
                                    (item) => item.type === "link"
                                  ) || [];
                                return (
                                  <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-2 items-start justify-between sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-start gap-4">
                                      {image && (
                                        <div className="text-4xl">
                                          <img
                                            src={`${process.env.SERVER_URL}/proxy?url=${image}`}
                                            className="h-16 w-16 object-cover object-center rounded-lg"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <h4 className="font-semibold text-gray-900 max-w-md line-clamp-2 hover:text-primary duration-200 transition-colors cursor-pointer">
                                              {item.name}
                                            </h4>
                                          </DialogTrigger>
                                          <DialogContent className="max-h-[90vh] overflow-hidden p-0">
                                            <ScrollArea className="max-h-[90vh] h-full w-full">
                                              <div className="p-5">
                                                <DialogHeader>
                                                  <DialogTitle>
                                                    Item Information
                                                  </DialogTitle>
                                                </DialogHeader>
                                                <div className="flex-1 mt-6">
                                                  <h4 className="font-semibold text-gray-900 max-w-md">
                                                    {item.name}
                                                  </h4>
                                                  {item.category && <p className="text-sm text-gray-600 mt-1">
                                                    Category: {item.category}
                                                  </p>}
                                                  <p className="text-sm text-gray-600 mt-1">
                                                    Qty: {quantity}
                                                  </p>
                                                  {item.note && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                      <span className="font-medium">
                                                        Note:
                                                      </span>{" "}
                                                      {(item.note, 150)}
                                                    </div>
                                                  )}
                                                  {pictureItems.length > 0 && (
                                                    <div className="mt-4">
                                                      <strong className="text-sm">
                                                        Pictures:
                                                      </strong>
                                                      {pictureItems.map(
                                                        (item, itemIndex) => (
                                                          <div
                                                            key={itemIndex}
                                                            className="ml-4 mt-3"
                                                          >
                                                            {item.pictures &&
                                                              item.pictures
                                                                .length > 0 && (
                                                                <div className="flex gap-2.5 flex-wrap mb-2">
                                                                  {item.pictures.map(
                                                                    (
                                                                      pic,
                                                                      picIndex
                                                                    ) => (
                                                                      <img
                                                                        key={
                                                                          picIndex
                                                                        }
                                                                        src={
                                                                          pic.url
                                                                        }
                                                                        alt={
                                                                          pic.filename
                                                                        }
                                                                        className="w-[50px] h-[50px] object-cover rounded-[15px] border border-gray-300"
                                                                      />
                                                                    )
                                                                  )}
                                                                </div>
                                                              )}
                                                            <div className="text-sm">
                                                              Qty:{" "}
                                                              {formatNum(
                                                                item.quantity
                                                              )}
                                                            </div>
                                                            {item.note && (
                                                              <div className="text-sm italic text-gray-500 mt-1">
                                                                {item.note}
                                                              </div>
                                                            )}
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                  {linkItems.length > 0 && (
                                                    <div className="mt-4">
                                                      <strong className="text-sm">
                                                        Links:
                                                      </strong>
                                                      {linkItems.map(
                                                        (item, itemIndex) => (
                                                          <div
                                                            key={itemIndex}
                                                            className="ml-4 mt-2"
                                                          >
                                                            {item.link && (
                                                              <div className="text-sm">
                                                                <a
                                                                  href={
                                                                    item.link
                                                                  }
                                                                  className="text-[#fc6320] hover:underline break-all line-clamp-1"
                                                                >
                                                                  {item.link}
                                                                </a>
                                                              </div>
                                                            )}
                                                            <div className="text-sm">
                                                              Qty:{" "}
                                                              {formatNum(
                                                                item.quantity
                                                              )}
                                                            </div>
                                                            {item.note && (
                                                              <div className="text-sm italic text-gray-500 mt-1">
                                                                {item.note}
                                                              </div>
                                                            )}
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </ScrollArea>
                                          </DialogContent>
                                        </Dialog>
                                        {item.category && <p className="text-sm text-gray-600 mt-1">
                                          Category: {item.category}
                                        </p>}
                                        <p className="text-sm text-gray-600 mt-1">
                                          Qty: {quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <div
                                        className="rounded-full flex items-center gap-2 px-[10px] py-[6px] text-[.82rem] font-semibold"
                                        style={{
                                          backgroundColor: statusInfo?.bgColor,
                                          color: statusInfo?.color ?? "#fff",
                                        }}
                                      >
                                        <IconComponent className="size-4" />
                                        {statusInfo?.text}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </FadeScrollArea>
                </CardContent>
              </Card>
            );
          })
        )}
        <div className="mt-7">
          <AdvancedPagination
            initialPage={page}
            isLoading={isLoading || isFetching}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
        <UpdateDialog open={open} setOpen={setOpen} order={order} />
      </div>
    </div>
  );
};

export default AllOrders;
