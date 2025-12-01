import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IOrder, OrderType } from "@/interfaces/order.interface";
import useCopy from "@/lib/copy";
import { useGetOrdersQuery } from "@/services/order.service";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useState } from "react";
import * as LucideIcons from "lucide-react";
import { orderStatusInfo } from "@/lib/constants";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentCodes, PaymentStatus } from "@/interfaces/payment.interface";
import { formatNum } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import debounce from "lodash.debounce";
import Link from "next/link";
type LucideIconName = keyof typeof LucideIcons;

const Shipments = () => {
  const { copyToClipboard } = useCopy();
  const router = useRouter();
  const { search } = router.query;
  const [page, setPage] = useState<number>(1);
  const [openPayment, setOpenPayment] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const userId = useAppSelector((state) => state.user.user?.id);
  const { data, isLoading, isFetching } = useGetOrdersQuery(
    {
      search: search as string,
      statuses: [],
      page: page - 1,
      types: [OrderType.SHIPMENT],
    },
    {
      skip: !userId,
    }
  );
  const shipments = data?.data.data ?? [];
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

  return (
    <div className="max-w-4xl mt-7">
      <div className="flex items-center gap-3 justify-between mb-8">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Shipment(s)"
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
      </div>
      <div className="flex flex-col gap-5 space-y-3">
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
                  <Skeleton className="w-full h-5" />
                </CardContent>
              </Card>
            );
          })
        ) : shipments.length === 0 ? (
          <div className="w-full flex justify-center mt-10">
            <p className="text-2xl font-semibold">No shipments found</p>
          </div>
        ) : (
          <>
            {shipments.map((shipment) => {
              // const pendingPayments = shipment.payments.filter(
              //   (payment) => payment.status === PaymentStatus.PENDING
              // );
              // const pendingItemsPayments = shipment.shipmentItems.map((item) =>
              //   item.payments.filter((i) => i.status === PaymentStatus.PENDING)
              // );
              // const totalPendingPayments = [
              //   ...pendingPayments,
              //   ...pendingItemsPayments.flat(),
              // ];
              // const hasPendingPayments =
              //   shipment.type === OrderType.SHIPMENT &&
              //   totalPendingPayments.length > 0;
              const shippingFee = shipment.payments.find(
                (s) =>
                  s.code === PaymentCodes.SHIPPING_FEE &&
                  s.status === PaymentStatus.PENDING
              );
              const statusInfo = orderStatusInfo[shipment.status];
              const IconComponent = LucideIcons[
                statusInfo?.icon as LucideIconName
              ] as LucideIcons.LucideIcon;

              return (
                <Card
                  key={shipment.id}
                  className="overflow-hidden shadow-none p-0 gap-0"
                >
                  <CardHeader className="bg-white border-b p-5 !pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {shipment.orderNumber}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <LucideIcons.Truck className="w-4 h-4" />
                          Created on{" "}
                          {format(shipment.createdAt, "MM/dd/yyy h:mm a")}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {IconComponent && (
                          <div className="w-full sm:w-fit mb-3 sm:mb-0">
                            <div
                              className="rounded-full w-fit flex items-center gap-2 px-[10px] mr-2 py-[6px] text-[.82rem] font-semibold text-nowrap"
                              style={{
                                backgroundColor: statusInfo?.bgColor,
                                color: statusInfo?.color ?? "#fff",
                              }}
                            >
                              <IconComponent className="size-4" />
                              {statusInfo?.text}
                            </div>
                          </div>
                        )}
                        {/* {hasPendingPayments && (
                        <div className="flex items-center gap-2">
                          <Button
                            className="font-semibold text-[.8rem] h-11"
                            onClick={() => {
                              setOpenPayment(true);
                              setOrder(shipment);
                            }}
                          >
                            Pay Now
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <LucideIcons.Info className="size-5 cursor-pointer text-gray-400" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Pending Payment(s)</DialogTitle>
                                <VisuallyHidden>
                                  <DialogDescription />
                                </VisuallyHidden>
                              </DialogHeader>
                              <div className="pt-4 flex flex-col gap-2">
                                {totalPendingPayments.map((payment) => {
                                  return (
                                    <div
                                      className="flex items-center justify-between gap-5"
                                      key={payment.id}
                                    >
                                      <p className="text-[.9rem]">
                                        {payment.description}
                                      </p>
                                      <p className="text-[.95rem] font-semibold">
                                        ₦{formatNum(payment.amount ?? 0)}
                                      </p>
                                    </div>
                                  );
                                })}
                                <div className="flex items-center justify-between gap-5 mt-4">
                                  <p className="text-[.95rem] font-bold">
                                    Total
                                  </p>
                                  <p className="text-[.95rem] font-bold">
                                    ₦
                                    {formatNum(
                                      totalPendingPayments.reduce(
                                        (acc, cur) => {
                                          return (acc += cur.amount);
                                        },
                                        0
                                      )
                                    )}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )} */}
                        <Dialog>
                          <DialogTrigger>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shadow-none h-11"
                              // onClick={() => setSelectedShipmentForTracking(shipment)}
                            >
                              <LucideIcons.Eye className="w-4 h-4" />
                              Track
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ScrollArea className="max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>Shipment Progress</DialogTitle>
                              </DialogHeader>
                              <div>
                                <div className="mt-5 flex flex-col gap-4">
                                  {/* {shipment.trackingUpdates.map(
                                  ({
                                    title,
                                    description,
                                    createdAt,
                                    stage,
                                    id,
                                  }) => {
                                    return (
                                      <div key={id} className="flex gap-3">
                                        {statusIcons[stage]}
                                        <div className="flex flex-col gap-1">
                                          <p className="font-medium">{title}</p>
                                          <p className="text-sm text-wrap">
                                            {description}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {format(createdAt, "yyyy-MM-dd")}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }
                                )} */}
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-6 mb-6 p-6 pb-0">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <LucideIcons.Package className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Total Weight
                            </div>
                            <div className="font-semibold">
                              {shipment.packageWeight ||
                                shipment.shipmentItems.reduce(
                                  (acc, cur) => (acc += cur.packageWeight),
                                  0
                                ) ||
                                0}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideIcons.Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Tracking Number
                            </div>
                            <div className="font-semibold">
                              {shipment.trackingNumber ?? "---"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <LucideIcons.Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Delivered
                            </div>
                            <div className="font-semibold">
                              {shipment.deliveredAt
                                ? format(shipment.deliveredAt, "MM/dd/yyy")
                                : "---"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideIcons.MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Shipping Fee
                            </div>
                            <div className="font-semibold">
                              {shippingFee
                                ? `₦${formatNum(shippingFee.amount)}`
                                : "---"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t p-6">
                      {/* <h4 className="font-semibold mb-3 text-gray-900">
                  Items in Shipment
                </h4> */}
                      {/* {sourcePurchaseOrders && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">
                        Consolidated from {sourcePurchaseOrders.length}{" "}
                        purchase orders:
                      </span>
                      <span className="block mt-1 text-blue-700">
                        {sourcePurchaseOrders.join(", ")}
                      </span>
                    </p>
                  </div>
                )} */}
                      <div className="space-y-2">
                        {shipment.shipmentItems.map((item, idx) => {
                          const images = item.items
                            .map((i) => (i.pictures ?? []).map((p) => p.url))
                            .flat();
                          const image = images?.[0] ?? item.product?.image;
                          const nameToUse =
                            item.name ?? item.product.description;
                          const quantityToUse =
                            item.items
                              .map((i) => i.quantity ?? 0)
                              .reduce((acc, cur) => (acc += cur), 0) ||
                            item.quantity;

                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between gap-5 p-3 bg-gray-50 rounded"
                            >
                              <div className="flex items-start gap-3">
                                {image && (
                                  <img
                                    src={image}
                                    className="h-16 w-16 object-cover object-center rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div>
                                  <span className="hidden sm:inline-block text-gray-900 font-medium">
                                    {nameToUse}
                                  </span>
                                  <p className="sm:hidden text-[.94rem] font-medium sm:font-medium cursor-pointer">
                                    {nameToUse}
                                  </p>
                                  <span className="text-gray-600 block text-sm">
                                    Qty: {quantityToUse}
                                  </span>
                                </div>
                              </div>
                              {item.trackingNumber && (
                                <Badge
                                  variant="outline"
                                  className="text-xs cursor-pointer"
                                  onClick={() => {
                                    copyToClipboard({
                                      id: item.id,
                                      text: item.trackingNumber,
                                      message:
                                        "Tracking number copied to clipboard",
                                    });
                                  }}
                                >
                                  <LucideIcons.Copy className="w-4 h-4" />
                                  {item.trackingNumber}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
        {/* <PaymentDialog
        onOpenChange={setOpenPayment}
        open={openPayment}
        orderItemId={order?.id}
        payments={(order?.payments ?? []).filter(
          (payment) => payment.status === PaymentStatus.PENDING
        )}
      /> */}
        <div className="mt-7">
          <AdvancedPagination
            initialPage={page}
            isLoading={isLoading || isFetching}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Shipments;
